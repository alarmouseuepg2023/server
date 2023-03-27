import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { RolesKeys } from "@commons/RolesKey";
import { InviteStatusDomain } from "@domains/InviteStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { getUserType2External } from "@helpers/getUserType2External";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { AcceptInviteRequestModel } from "@http/dtos/invite/AcceptInviteRequestModel";
import { AcceptInviteResponseModel } from "@http/dtos/invite/AcceptInviteResponseModel";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { IInviteRepository } from "@infra/database/repositories/invite";
import { IUserRepository } from "@infra/database/repositories/user";
import { InviteModel } from "@models/InviteModel";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

import { AnswerInviteService } from "./AnswerInviteService";

@injectable()
class AcceptInviteService extends AnswerInviteService<
  AcceptInviteRequestModel,
  AcceptInviteResponseModel
> {
  constructor(
    @inject("UniqueIdentifierProvider")
    uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("UserRepository")
    userRepository: IUserRepository,
    @inject("InviteRepository")
    inviteRepository: IInviteRepository,
    @inject("HashProvider")
    hashProvider: IHashProvider,
    @inject("DateProvider")
    dateProvider: IDateProvider,
    @inject("DeviceAccessControlRepository")
    deviceAccessControl: IDeviceAccessControlRepository,
    @inject("ValidatorsProvider")
    validatorsProvider: IValidatorsProvider,
    @inject("MaskProvider")
    maskProvider: IMaskProvider
  ) {
    super(
      uniqueIdentifierProvider,
      userRepository,
      inviteRepository,
      hashProvider,
      dateProvider,
      deviceAccessControl,
      validatorsProvider,
      maskProvider
    );
  }

  protected getReturnObject = (
    inviteUpdated: InviteModel,
    deviceAccessControl: { role: string } | null
  ): AcceptInviteResponseModel =>
    ({
      ...this.convertReturnObjectBase(inviteUpdated),
      role: getUserType2External(deviceAccessControl?.role || "ERROR"),
    } as AcceptInviteResponseModel);

  protected handleDeviceAccessControl = async (
    deviceId: string,
    { password, userId }: AcceptInviteRequestModel
  ): Promise<void> => {
    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: i18n.__("ErrorEnvVarNotFound"),
    });

    this.deviceAccessControlOperation = this.deviceAccessControlRepository.save(
      {
        deviceId,
        password: await this.hashProvider.hash(password, hashSalt),
        role: RolesKeys.GUEST,
        userId,
      }
    );
  };

  protected getInviteStatus = (): number => InviteStatusDomain.ACCEPTED;

  public async execute({
    token,
    userId,
    id,
    confirmPassword,
    password,
  }: AcceptInviteRequestModel): Promise<AcceptInviteResponseModel> {
    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorPasswordRequired"));

    if (stringIsNullOrEmpty(confirmPassword))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorConfirmPasswordRequired")
      );

    if (password !== confirmPassword)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorPasswordAndConfirmAreNotEqual")
      );

    if (!this.validatorsProvider.devicePassword(password))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDevicePasswordInvalid"));

    const result = await super.execute({
      confirmPassword,
      id,
      password,
      token,
      userId,
    });

    return result;
  }
}

export { AcceptInviteService };
