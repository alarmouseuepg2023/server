import { inject, injectable } from "inversify";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { InviteStatusDomain } from "@domains/InviteStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import {
  getMessage,
  getVariableMessage,
} from "@helpers/translatedMessagesControl";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { IInviteRepository } from "@infra/database/repositories/invite";
import { IUserRepository } from "@infra/database/repositories/user";
import { transaction } from "@infra/database/transaction";
import { AnswerInviteRequestModel } from "@infra/dtos/invite/AnswerInviteRequestModel";
import { AnswerInviteResponseModel } from "@infra/dtos/invite/AnswerInviteResponseModel";
import { logger } from "@infra/log";
import { InviteModel } from "@models/InviteModel";
import { PrismaPromise } from "@prisma/client";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class AnswerInviteService<
  T extends AnswerInviteRequestModel = AnswerInviteRequestModel,
  K extends AnswerInviteResponseModel = AnswerInviteResponseModel
> {
  private _deviceAccessControlOperation: PrismaPromise<{
    role: string;
  }> | null = null;

  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("InviteRepository")
    private inviteRepository: IInviteRepository,
    @inject("HashProvider")
    protected hashProvider: IHashProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("DeviceAccessControlRepository")
    protected deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("ValidatorsProvider")
    protected validatorsProvider: IValidatorsProvider,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public get deviceAccessControlOperation(): PrismaPromise<{
    role: string;
  }> | null {
    return this._deviceAccessControlOperation;
  }

  public set deviceAccessControlOperation(
    operation: PrismaPromise<{ role: string }> | null
  ) {
    this._deviceAccessControlOperation = operation;
  }

  protected getReturnObject = (
    inviteUpdated: InviteModel,
    _: { role: string } | null
  ): K => this.convertReturnObjectBase(inviteUpdated);

  protected convertReturnObjectBase = (inviteUpdated: InviteModel): K =>
    ({
      id: inviteUpdated.id,
      answeredAt: this.maskProvider.timestamp(inviteUpdated.answeredAt as Date),
      invitedAt: this.maskProvider.timestamp(inviteUpdated.invitedAt),
      status: getEnumDescription(
        "INVITE_STATUS",
        InviteStatusDomain[inviteUpdated.status]
      ),
    } as K);

  protected handleDeviceAccessControl = async (
    _: string,
    __: T
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> => {};

  protected getInviteStatus = (): number => {
    logger.error("Abstract method not implemented at answered invite service");

    throw new AppError(
      "INTERNAL_SERVER_ERROR",
      getMessage("ErrorGenericUnknown")
    );
  };

  public async execute(input: T): Promise<K> {
    const { id, token, userId } = input;

    if (stringIsNullOrEmpty(token))
      throw new AppError("BAD_REQUEST", getMessage("ErrorInviteTokenRequired"));

    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(id))
      throw new AppError("BAD_REQUEST", getMessage("ErrorInviteIdRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(userId) ||
      !this.uniqueIdentifierProvider.isValid(id)
    )
      throw new AppError("BAD_REQUEST", getMessage("ErrorUUIDInvalid"));

    const [hasUser] = await transaction([
      this.userRepository.getById({ id: userId }),
    ]);

    if (!hasUser)
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorUserNotFound", [getMessage("RandomWord_User")])
      );

    const [hasInvite] = await transaction([
      this.inviteRepository.getByIdAndUser({
        id,
        userId,
      }),
    ]);

    if (!hasInvite)
      throw new AppError("NOT_FOUND", getMessage("ErrorInviteNotFound"));

    await this.handleDeviceAccessControl(hasInvite.deviceId, input);

    if (
      [InviteStatusDomain.ACCEPTED, InviteStatusDomain.REJECTED].includes(
        hasInvite.status
      )
    )
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorInviteAlreadyAnswered")
      );

    if (!(await this.hashProvider.compare(token, hasInvite.token)))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorAnswerInviteTokenInvalid")
      );

    const now = this.dateProvider.now();

    if (
      !this.dateProvider.isBefore(
        now,
        this.dateProvider.addMinutes(
          hasInvite.invitedAt,
          ConstantsKeys.MINUTES_TO_ANSWER_INVITE
        )
      )
    )
      throw new AppError("BAD_REQUEST", getMessage("ErrorAnswerInviteExpired"));

    const [inviteUpdated, deviceAccessControl] = await transaction(
      (() => {
        const list: PrismaPromise<any>[] = [
          this.inviteRepository.answer({
            id,
            answeredAt: this.dateProvider.now(),
            status: this.getInviteStatus(),
          }),
        ];

        if (this.deviceAccessControlOperation)
          list.push(this.deviceAccessControlOperation);

        return list;
      })()
    );

    return this.getReturnObject(inviteUpdated, deviceAccessControl);
  }
}

export { AnswerInviteService };
