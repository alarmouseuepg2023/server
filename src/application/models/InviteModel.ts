type InviteModel = {
  id: string;
  status: number;
  invitedAt: Date;
  token: string;
  answeredAt: Date | null;
};

export { InviteModel };
