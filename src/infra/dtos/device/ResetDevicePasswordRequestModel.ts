type ResetDevicePasswordRequestModel = {
  password: string;
  confirmPassword: string;
  oldPassword: string;
  userId: string;
  deviceId: string;
};

export { ResetDevicePasswordRequestModel };
