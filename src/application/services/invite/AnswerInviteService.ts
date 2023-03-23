import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { InviteStatusDomain } from "@domains/InviteStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { AnswerInviteRequestModel } from "@http/dtos/invite/AnswerInviteRequestModel";
import { IInviteRepository } from "@infra/database/repositories/invite";
import { IUserRepository } from "@infra/database/repositories/user";
import { transaction } from "@infra/database/transaction";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class AnswerInviteService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("InviteRepository")
    private inviteRepository: IInviteRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider
  ) {}

  public async execute({
    answer,
    token,
    userId,
    id,
  }: AnswerInviteRequestModel): Promise<void> {
    if (stringIsNullOrEmpty(token))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorInviteTokenRequired"));

    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(id))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorInviteIdRequired"));

    if (stringIsNullOrEmpty(answer))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorInviteAnswerRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(userId) ||
      !this.uniqueIdentifierProvider.isValid(id)
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [hasUser] = await transaction([
      this.userRepository.getById({ id: userId }),
    ]);

    if (!hasUser)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorUserNotFound", [i18n.__("RandomWord_User")])
      );

    const [hasInvite] = await transaction([
      this.inviteRepository.getByIdAndUser({
        id,
        userId,
      }),
    ]);

    if (!hasInvite)
      throw new AppError("NOT_FOUND", i18n.__("ErrorInviteNotFound"));

    if (
      [InviteStatusDomain.ACCEPTED, InviteStatusDomain.REJECTED].includes(
        hasInvite.status
      )
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorInviteAlreadyAnswered"));

    if (!(await this.hashProvider.compare(token, hasInvite.token)))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorAnswerInviteTokenInvalid")
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
      throw new AppError("BAD_REQUEST", i18n.__("ErrorAnswerInviteExpired"));
  }
}

export { AnswerInviteService };
