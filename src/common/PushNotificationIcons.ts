import { env } from "@helpers/env";

class PushNotificationIcons {
  public static readonly ERROR: string = `${env(
    "API_BASE_URL"
  )}/pushNotifications/icons/error.png`;
}

export { PushNotificationIcons };
