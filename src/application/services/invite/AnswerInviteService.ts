import { AnswerInviteRequestModel } from "@http/dtos/invite/AnswerInviteRequestModel";

class AnswerInviteService {
  public async execute(obj: AnswerInviteRequestModel): Promise<void> {
    console.log(obj);
  }
}

export { AnswerInviteService };
