import { ConfirmUserDeletionRequestModel } from "@http/dtos/user/ConfirmUserDeletionRequestModel";

class ConfirmDeletionService {
  public async execute(obj: ConfirmUserDeletionRequestModel): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { ConfirmDeletionService };
