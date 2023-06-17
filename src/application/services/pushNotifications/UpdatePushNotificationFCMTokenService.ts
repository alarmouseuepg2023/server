import { injectable } from "inversify";

import { UpdatePushNotificationFCMTokenRequestModel } from "@infra/dtos/pushNotifications/UpdatePushNotificationFCMTokenRequestModel";
import { UpdatePushNotificationFCMTokenResponseModel } from "@infra/dtos/pushNotifications/UpdatePushNotificationFCMTokenResponseModel";

@injectable()
class UpdatePushNotificationFCMTokenService {
  public async execute(
    obj: UpdatePushNotificationFCMTokenRequestModel
  ): Promise<UpdatePushNotificationFCMTokenResponseModel> {
    console.log(obj);

    return {
      fcmToken: "",
      notificationEnabled: true,
      userId: "",
    };
  }
}

export { UpdatePushNotificationFCMTokenService };
