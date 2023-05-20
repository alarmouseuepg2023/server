type ChangeDeviceStatusResponseModel = {
  id: string;
  status: string;
  nickname: string;
  alarmEvent: {
    message: string;
    createdAt: string;
  };
};

export { ChangeDeviceStatusResponseModel };
