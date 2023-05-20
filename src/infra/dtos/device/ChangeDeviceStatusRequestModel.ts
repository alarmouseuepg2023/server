type ChangeDeviceStatusRequestModel = {
  userId: string | null;
  password: string | null;
  deviceId: string;
  status: string;
};

export { ChangeDeviceStatusRequestModel };
