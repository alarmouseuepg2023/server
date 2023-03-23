type AnswerInviteRequestModel = {
  userId: string;
  token: string;
  answer: "accept" | "reject";
};

export { AnswerInviteRequestModel };
