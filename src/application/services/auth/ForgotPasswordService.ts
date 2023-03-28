import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { ForgotPasswordRequestModel } from "@http/dtos/auth/ForgotPasswordRequestModel";
import { IUserRepository } from "@infra/database/repositories/user";
import { transaction } from "@infra/database/transaction";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class ForgotPasswordService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository
  ) {}

  public async execute({
    email,
  }: ForgotPasswordRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(email))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailRequired"));

    if (!this.validatorsProvider.email(email))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailInvalid"));

    const [hasUser] = await transaction([
      this.userRepository.hasEmail({ email }),
    ]);

    if (!hasUser)
      throw new AppError(
        "NOT_FOUND",
        i18n.__mf("ErrorUserNotFound", [i18n.__("RandomWord_User")])
      );

    return true;
  }
}

export { ForgotPasswordService };
