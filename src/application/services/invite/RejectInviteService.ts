import { inject, injectable } from "inversify";

import { InviteStatusDomain } from "@domains/InviteStatusDomain";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { IInviteRepository } from "@infra/database/repositories/invite";
import { IUserRepository } from "@infra/database/repositories/user";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

import { AnswerInviteService } from "./AnswerInviteService";

@injectable()
class RejectInviteService extends AnswerInviteService {
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

  protected getInviteStatus = (): number => InviteStatusDomain.REJECTED;
}

export { RejectInviteService };
