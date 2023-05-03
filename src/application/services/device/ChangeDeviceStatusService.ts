import i18n from "i18n";
import { inject, injectable } from "inversify";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { TopicsMQTT } from "@commons/TopicsMQTT";
import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { ChangeDeviceStatusRequestModel } from "@http/dtos/device/ChangeDeviceStatusRequestModel";
import { ChangeDeviceStatusResponseModel } from "@http/dtos/device/ChangeDeviceStatusResponseModel";
import { IAlarmEventsRepository } from "@infra/database/repositories/alarmEvents";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { IUserRepository } from "@infra/database/repositories/user";
import { transaction } from "@infra/database/transaction";
import { mqttClient } from "@infra/mqtt/client";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class ChangeDeviceStatusService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("DeviceRepository")
    protected deviceRepository: IDeviceRepository,
    @inject("AlarmEventsRepository")
    private alarmEventsRepository: IAlarmEventsRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("MaskProvider")
    protected maskProvider: IMaskProvider,
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository
  ) {}

  protected canChangeToAnyStatus = (): boolean => false;

  public async execute(
    { deviceId, status, userId, password }: ChangeDeviceStatusRequestModel,
    userRequired = true,
    publishChangedStatus = true
  ): Promise<ChangeDeviceStatusResponseModel> {
    if (userRequired) {
      if (stringIsNullOrEmpty(userId))
        throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

      if (stringIsNullOrEmpty(password))
        throw new AppError(
          "BAD_REQUEST",
          i18n.__("ErrorDevicePasswordRequired")
        );

      if (!this.uniqueIdentifierProvider.isValid(userId as string))
        throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

      const [hasDeviceAccessControl, hasUser] = await transaction([
        this.deviceAccessControlRepository.getById({
          deviceId,
          userId: userId || "",
        }),
        this.userRepository.getById({ id: userId || "" }),
      ]);

      if (!hasDeviceAccessControl)
        throw new AppError(
          "NOT_FOUND",
          i18n.__("ErrorDeviceAccessControlNotFound")
        );

      if (hasDeviceAccessControl.blocked)
        throw new AppError(
          "UNAUTHORIZED",
          i18n.__("ErrorUserIsBlockedAtDevice")
        );

      if (!hasUser)
        throw new AppError(
          "NOT_FOUND",
          i18n.__mf("ErrorUserNotFound", [i18n.__("RandomWord_User")])
        );

      const now = this.dateProvider.now();

      if (
        !(await this.hashProvider.compare(
          password || "",
          hasDeviceAccessControl.password
        ))
      ) {
        const attempts =
          !hasDeviceAccessControl.lastFailedUnlock ||
          this.dateProvider.isBefore(
            now,
            this.dateProvider.addMinutes(
              hasDeviceAccessControl.lastFailedUnlock,
              ConstantsKeys.MINUTES_TO_RESET_FAILED_LOGIN_ATTEMPTS_AT_DEVICE
            )
          )
            ? hasDeviceAccessControl.unlockAttempts + 1
            : 1;

        const [deviceAccessControlUpdated] = await transaction([
          this.deviceAccessControlRepository.updateControlProps({
            deviceId,
            userId: hasUser.id,
            unlockAttempts: attempts,
            lastFailedUnlock: now,
            blocked: attempts === ConstantsKeys.MAX_LOGIN_ATTEMPTS_AT_DEVICE,
          }),
        ]);

        if (
          deviceAccessControlUpdated.unlockAttempts <
          ConstantsKeys.MAX_LOGIN_ATTEMPTS_AT_DEVICE
        )
          throw new AppError(
            "UNAUTHORIZED",
            i18n.__mf(
              "ErrorLoginAtDeviceUserUnauthorizedAndWillBeBlockedInFewAttempts",
              [
                ConstantsKeys.MAX_LOGIN_ATTEMPTS_AT_DEVICE -
                  deviceAccessControlUpdated.unlockAttempts,
              ]
            )
          );

        if (deviceAccessControlUpdated.blocked)
          throw new AppError(
            "UNAUTHORIZED",
            i18n.__("ErrorLoginAtDeviceUserWillBeBlocked")
          );
      }

      await transaction([
        this.deviceAccessControlRepository.updateControlProps({
          deviceId,
          userId: hasUser.id,
          unlockAttempts: 0,
          blocked: false,
          lastFailedUnlock: null,
        }),
      ]);
    }

    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceIdRequired"));

    if (stringIsNullOrEmpty(status))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorStatusRequired"));

    const statusConverted = toNumber({
      value: status,
      error: i18n.__("ErrorStatusInvalid"),
    });

    if (!(statusConverted in DeviceStatusDomain))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorStatusOutOfDomain"));

    if (
      !this.canChangeToAnyStatus() &&
      [DeviceStatusDomain.TRIGGERED, DeviceStatusDomain.UNCONFIGURED].includes(
        statusConverted
      )
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorCantUpdateDeviceStatus"));

    if (!this.uniqueIdentifierProvider.isValid(deviceId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [hasDevice] = await transaction([
      this.deviceRepository.getById({
        deviceId,
      }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", i18n.__("ErrorDeviceNotFound"));

    if (hasDevice.status === statusConverted)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorUpdateDeviceWithoutChangeStatus", [
          getEnumDescription(
            "DEVICE_STATUS",
            DeviceStatusDomain[statusConverted]
          ),
        ])
      );

    const [updated, alarmEventCreated] = await transaction([
      this.deviceRepository.updateStatus({ deviceId, status: statusConverted }),
      this.alarmEventsRepository.save({
        deviceId,
        userId,
        message: i18n.__mf("AlarmEvents_ChangeStatus", [
          getEnumDescription(
            "DEVICE_STATUS",
            DeviceStatusDomain[hasDevice.status as number]
          ),
          getEnumDescription(
            "DEVICE_STATUS",
            DeviceStatusDomain[statusConverted]
          ),
        ]),
        createdAt: this.dateProvider.now(),
        id: this.uniqueIdentifierProvider.generate(),
      }),
    ]);

    if (hasDevice.macAddress && publishChangedStatus)
      mqttClient.publish(
        TopicsMQTT.ALL_PUB_CHANGE_DEVICE_STATUS(
          this.maskProvider.macAddress(hasDevice.macAddress)
        ),
        Buffer.from(`${statusConverted}`)
      );

    return {
      id: updated.id,
      nickname: updated.nickname,
      status: getEnumDescription(
        "DEVICE_STATUS",
        DeviceStatusDomain[updated.status]
      ),
      alarmEvent: {
        message: alarmEventCreated.message,
        createdAt: this.maskProvider.timestamp(alarmEventCreated.createdAt),
      },
    };
  }
}

export { ChangeDeviceStatusService };
