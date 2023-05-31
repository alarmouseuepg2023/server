import { ForgotDevicePasswordRequestModel } from "./ForgotDevicePasswordRequestModel";

type ResetDevicePasswordRequestModel = ForgotDevicePasswordRequestModel & {
  pin: string;
  password: string;
  confirmPassword: string;
};

export { ResetDevicePasswordRequestModel };
