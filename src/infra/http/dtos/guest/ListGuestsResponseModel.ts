type ListGuestsResponseModel = {
  id: string;
  name: string;
  email: string;
  invitedAt: {
    timestamp: string;
    readableDate: string;
  };
  answeredAt: {
    timestamp: string;
    readableDate: string;
  };
};

export { ListGuestsResponseModel };
