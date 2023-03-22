import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { CreateInviteRequestModel } from "@http/dtos/invite/CreateInviteRequestModel";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class CreateInviteService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider
  ) {}

  public async execute({
    guestId,
    ownerId,
  }: CreateInviteRequestModel): Promise<void> {
    if (stringIsNullOrEmpty(guestId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorGuestIdRequired"));

    if (stringIsNullOrEmpty(ownerId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorOwnerIdRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(guestId) ||
      !this.uniqueIdentifierProvider.isValid(ownerId)
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));
  }
}

export { CreateInviteService };
