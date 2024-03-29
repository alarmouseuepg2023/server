import { inject, injectable } from "inversify";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import {
  getMessage,
  getVariableMessage,
} from "@helpers/translatedMessagesControl";
import { transaction } from "@infra/database/transaction";
import { LoginRequestModel, LoginResponseModel } from "@infra/dtos/auth";
import { IAuthTokenPayload, IAuthTokenProvider } from "@providers/authToken";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IUserRepository } from "@repositories/user";

@injectable()
class LoginService {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("AuthTokenProvider")
    private authTokenProvider: IAuthTokenProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider
  ) {}

  public async execute({
    email,
    password,
  }: LoginRequestModel): Promise<LoginResponseModel> {
    if (stringIsNullOrEmpty(email))
      throw new AppError("BAD_REQUEST", getMessage("ErrorEmailRequired"));

    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", getMessage("ErrorPasswordRequired"));

    const [hasUser] = await transaction([
      this.userRepository.hasEmail({ email }),
    ]);

    if (!hasUser)
      throw new AppError(
        "UNAUTHORIZED",
        getMessage("ErrorLoginUserUnauthorized")
      );

    if (hasUser.blocked)
      throw new AppError("UNAUTHORIZED", getMessage("ErrorUserIsBlocked"));

    const now = this.dateProvider.now();

    if (!(await this.hashProvider.compare(password, hasUser.password))) {
      const attempts =
        !hasUser.lastFailedLoginDate ||
        this.dateProvider.isBefore(
          now,
          this.dateProvider.addMinutes(
            hasUser.lastFailedLoginDate,
            ConstantsKeys.MINUTES_TO_RESET_FAILED_LOGIN_ATTEMPTS
          )
        )
          ? hasUser.loginAttempts + 1
          : 1;

      const [userUpdated] = await transaction([
        this.userRepository.updateLoginControlProps({
          userId: hasUser.id,
          attempts,
          blocked: attempts === ConstantsKeys.MAX_LOGIN_ATTEMPTS,
          loginFailedDate: now,
        }),
      ]);

      if (
        (userUpdated.loginAttempts as number) >=
          ConstantsKeys.MAX_LOGIN_ATTEMPTS * 0.7 &&
        (userUpdated.loginAttempts as number) !==
          ConstantsKeys.MAX_LOGIN_ATTEMPTS
      )
        throw new AppError(
          "UNAUTHORIZED",
          getVariableMessage(
            "ErrorLoginUserUnauthorizedAndWillBeBlockedInFewAttempts",
            [
              ConstantsKeys.MAX_LOGIN_ATTEMPTS -
                (userUpdated.loginAttempts as number),
            ]
          )
        );

      if (userUpdated.blocked)
        throw new AppError(
          "UNAUTHORIZED",
          getMessage("ErrorLoginUserWillBeBlocked")
        );

      throw new AppError(
        "UNAUTHORIZED",
        getMessage("ErrorLoginUserUnauthorized")
      );
    }

    await transaction([
      this.userRepository.updateLoginControlProps({
        userId: hasUser.id,
        attempts: 0,
        blocked: false,
        loginFailedDate: null,
      }),
    ]);

    const accessToken = this.authTokenProvider.generate({
      id: hasUser.id,
      name: hasUser.name,
      email: hasUser.email,
      type: "accessToken",
    } as IAuthTokenPayload);

    const refreshToken = this.authTokenProvider.generate({
      id: hasUser.id,
      type: "refreshToken",
    } as IAuthTokenPayload);

    return {
      accessToken,
      refreshToken,
    };
  }
}

export { LoginService };
