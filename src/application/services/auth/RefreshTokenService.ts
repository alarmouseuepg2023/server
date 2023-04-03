import i18n from "i18n";
import { inject, injectable } from "inversify";

import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { LoginResponseModel } from "@http/dtos/auth";
import { IUserRepository } from "@infra/database/repositories/user";
import { transaction } from "@infra/database/transaction";
import { IAuthTokenPayload, IAuthTokenProvider } from "@providers/authToken";

@injectable()
class RefreshTokenService {
  constructor(
    @inject("AuthTokenProvider")
    private authTokenProvider: IAuthTokenProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository
  ) {}

  public async execute(tokenToRefresh: string): Promise<LoginResponseModel> {
    if (stringIsNullOrEmpty(tokenToRefresh))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorRefreshTokenRequired"));

    const payload = this.authTokenProvider.decode(tokenToRefresh);

    if (!payload || payload.type !== "refreshToken")
      throw new AppError("BAD_REQUEST", i18n.__("ErrorRefreshTokenInvalid"));

    if (payload.exp && Date.now() >= payload.exp * 1000)
      throw new AppError("BAD_REQUEST", i18n.__("ErrorRefreshTokenExpired"));

    try {
      if (!this.authTokenProvider.verify(tokenToRefresh, "refreshToken"))
        throw new AppError("BAD_REQUEST", i18n.__("ErrorRefreshTokenInvalid"));
    } catch (_) {
      throw new AppError("BAD_REQUEST", i18n.__("ErrorRefreshTokenInvalid"));
    }

    const [hasUser] = await transaction([
      this.userRepository.getById({ id: payload.id }),
    ]);

    if (!hasUser)
      throw new AppError("NOT_FOUND", i18n.__("ErrorRefreshUserNotFound"));

    const accessToken = this.authTokenProvider.generate({
      id: hasUser.id,
      name: hasUser.name,
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

export { RefreshTokenService };
