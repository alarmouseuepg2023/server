import { ForgotPasswordRequestModel } from "@http/dtos/auth/ForgotPasswordRequestModel";

class ForgotPasswordService {
  public async execute(obj: ForgotPasswordRequestModel): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { ForgotPasswordService };
