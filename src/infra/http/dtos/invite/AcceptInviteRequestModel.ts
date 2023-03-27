import { AnswerInviteRequestModel } from "./AnswerInviteRequestModel";

type AcceptInviteRequestModel = AnswerInviteRequestModel & {
  password: string;
  confirmPassword: string;
};

export { AcceptInviteRequestModel };
