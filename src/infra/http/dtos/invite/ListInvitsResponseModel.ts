type ListInvitsResponseModel = {
  id: string;
  invitedAt: string;
  inviter: {
    name: string;
  };
  device: {
    nickname: string;
  };
};

export { ListInvitsResponseModel };
