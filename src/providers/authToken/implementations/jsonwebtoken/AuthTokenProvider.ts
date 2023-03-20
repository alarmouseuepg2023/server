import { sign, decode as jwtDecode, verify as jwtVerify } from "jsonwebtoken";

import { env } from "@helpers/env";
import { IAuthTokenPayload, AuthTokenType } from "@providers/authToken/";
import { IAuthTokenProvider } from "@providers/authToken/models/IAuthTokenProvider";

class AuthTokenProvider implements IAuthTokenProvider {
  private readonly keys: { [key in AuthTokenType]: string };

  constructor() {
    this.keys = {
      accessToken: env("JWT_SECRET_KEY"),
      refreshToken: env("JWT_SECRET_KEY_REFRESH"),
    };
  }

  public generate = ({ type, ...rest }: IAuthTokenPayload): string =>
    sign({ type, ...rest }, this.keys[type], {
      expiresIn: type === "accessToken" ? "3d" : "15d",
    });

  public decode = (token: string): IAuthTokenPayload =>
    jwtDecode(token) as IAuthTokenPayload;

  public verify = (token: string, type: AuthTokenType): boolean =>
    !!jwtVerify(token, this.keys[type]);
}

export { AuthTokenProvider };
