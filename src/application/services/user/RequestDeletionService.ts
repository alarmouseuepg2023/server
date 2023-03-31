import { RequestUserDeletionRequestModel } from "@http/dtos/user/RequestUserDeletionRequestModel";

class RequestDeletionService {
  public async execute(obj: RequestUserDeletionRequestModel): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { RequestDeletionService };
