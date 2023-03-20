type InviteModel = {
  id: string;
  status: number;
  invitedAt: Date;
  token: string;
  answeredAt?: Date;
};

export { InviteModel };
