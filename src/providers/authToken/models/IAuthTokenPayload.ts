import { AuthTokenType } from "./AuthTokenType";

interface IAuthTokenPayload {
  id: string;
  name: string;
  iat: number;
  exp: number;
  type: AuthTokenType;
}

export { IAuthTokenPayload, AuthTokenType };
