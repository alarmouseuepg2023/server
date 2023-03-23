import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { ChangeDeviceStatusRequestModel } from "@http/dtos/device/ChangeDeviceStatusRequestModel";
import { ChangeDeviceStatusResponseModel } from "@http/dtos/device/ChangeDeviceStatusResponseModel";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { transaction } from "@infra/database/transaction";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class ChangeDeviceStatusService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository
  ) {}

  protected canChangeToAnyStatus = (): boolean => false;

  public async execute({
    deviceId,
    status,
    userId,
  }: ChangeDeviceStatusRequestModel): Promise<ChangeDeviceStatusResponseModel> {
    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

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
      [DeviceStatusDomain.TRIGGERED].includes(statusConverted)
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorCantUpdateDeviceStatus"));

    if (
      !this.uniqueIdentifierProvider.isValid(userId) ||
      !this.uniqueIdentifierProvider.isValid(deviceId)
    )
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

    const [updated] = await transaction([
      this.deviceRepository.updateStatus({ deviceId, status: statusConverted }),
    ]);

    return {
      id: updated.id,
      nickname: updated.nickname,
      status: getEnumDescription(
        "DEVICE_STATUS",
        DeviceStatusDomain[updated.status]
      ),
    };
  }
}

export { ChangeDeviceStatusService };
