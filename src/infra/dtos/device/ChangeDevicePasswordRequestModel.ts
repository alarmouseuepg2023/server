type ChangeDevicePasswordRequestModel = {
  password: string;
  confirmPassword: string;
  oldPassword: string;
  userId: string;
  deviceId: string;
};

export { ChangeDevicePasswordRequestModel };
