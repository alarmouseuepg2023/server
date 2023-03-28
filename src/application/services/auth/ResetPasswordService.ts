import { ResetPasswordRequestModel } from "@http/dtos/auth/ResetPasswordRequestModel";

class ResetPasswordService {
  public async execute(obj: ResetPasswordRequestModel): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { ResetPasswordService };
