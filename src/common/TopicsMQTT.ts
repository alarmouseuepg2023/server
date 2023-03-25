import { env } from "@helpers/env";

class TopicsMQTT {
  private static readonly publicTopicsHash = env("MQTT_PUBLIC_TOPICS_HASH");

  private static readonly privateTopicsHash = env("MQTT_PRIVATE_TOPICS_HASH");

  public static MOBILE_NOTIFICATION_INVITE = (userId: string): string =>
    `/alarmouse/mqtt/sm/${this.publicTopicsHash}/notification/invite/${userId}`;

  public static EMBEDDED_CHANGE_DEVICE_STATUS = (macAddress: string): string =>
    `/alarmouse/mqtt/se/${this.privateTopicsHash}/control/status/${macAddress}`;
}

export { TopicsMQTT };
