import { AuthTokenType, IAuthTokenPayload } from "./IAuthTokenPayload";

interface IAuthTokenProvider {
  generate(payload: IAuthTokenPayload): string;
  decode(token: string): IAuthTokenPayload;
  verify(token: string, type: AuthTokenType): boolean;
}

export { IAuthTokenProvider };
