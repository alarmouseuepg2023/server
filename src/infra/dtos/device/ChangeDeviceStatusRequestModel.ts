import { UserAuthenticationAtDeviceRequestModel } from "./UserAuthenticationAtDeviceRequestModel";

type ChangeDeviceStatusRequestModel = UserAuthenticationAtDeviceRequestModel & {
  status: string;
};

export { ChangeDeviceStatusRequestModel };
