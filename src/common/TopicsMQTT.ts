import { env } from "@helpers/env";

class TopicsMQTT {
  private static readonly publicTopicsHash = env("MQTT_PUBLIC_TOPICS_HASH");

  private static readonly privateTopicsHash = env("MQTT_PRIVATE_TOPICS_HASH");

  public static MOBILE_NOTIFICATION_INVITE = (userId: string): string =>
    `/alarmouse/mqtt/sm/${this.publicTopicsHash}/notification/invite/${userId}`;

  public static MOBILE_NOTIFICATION_DEVICE_TRIGGERED = (
    deviceId: string
  ): string =>
    `/alarmouse/mqtt/sm/${this.publicTopicsHash}/notification/triggered/${deviceId}`;

  public static EMBEDDED_PUB_CHANGE_DEVICE_STATUS = (
    macAddress: string
  ): string =>
    `/alarmouse/mqtt/se/${this.privateTopicsHash}/control/status/${macAddress}`;

  public static EMBEDDED_ERROR_AT_CREATE_DEVICE = (
    macAddress: string
  ): string =>
    `/alarmouse/mqtt/se/${this.privateTopicsHash}/control/error/create_device/${macAddress}`;

  public static EMBEDDED_SUB_CHANGE_DEVICE_STATUS = `/alarmouse/mqtt/es/${this.privateTopicsHash}/control/status`;

  public static EMBEDDED_CHANGE_WIFI = `/alarmouse/mqtt/se/${this.privateTopicsHash}/control/wifi`;
}

export { TopicsMQTT };
