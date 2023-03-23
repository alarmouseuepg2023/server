type AnswerInviteRequestModel = {
  userId: string;
  id: string;
  token: string;
  answer: "accept" | "reject";
  password: string;
  confirmPassword: string;
};

export { AnswerInviteRequestModel };
