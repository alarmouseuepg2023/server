import { AnswerInviteResponseModel } from "./AnswerInviteResponseModel";

type AcceptInviteResponseModel = AnswerInviteResponseModel & {
  role: string;
};

export { AcceptInviteResponseModel };
