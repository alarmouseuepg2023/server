import { ResetPasswordRequestModel } from "@http/dtos/user/ResetPasswordRequestModel";

class ResetPasswordService {
  public async execute(obj: ResetPasswordRequestModel): Promise<void> {
    console.log(obj);
  }
}

export { ResetPasswordService };
