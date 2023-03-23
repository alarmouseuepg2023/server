type AnswerInviteRequestModel = {
  userId: string;
  id: string;
  token: string;
  answer: "accept" | "reject";
};

export { AnswerInviteRequestModel };
