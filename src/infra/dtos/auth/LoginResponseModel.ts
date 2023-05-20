import { AuthTokenType } from "@providers/authToken";

type LoginResponseModel = {
  [key in AuthTokenType]: string;
};

export { LoginResponseModel };
