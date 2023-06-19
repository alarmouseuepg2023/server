import { injectable } from "inversify";

import { DeletePushNotificationRequestModel } from "@infra/dtos/pushNotifications/DeletePushNotificationRequestModel";

@injectable()
class DeletePushNotificationService {
  public async execute(
    obj: DeletePushNotificationRequestModel
  ): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { DeletePushNotificationService };
