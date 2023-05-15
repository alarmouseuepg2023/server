import { env } from "@helpers/env";

class TopicsMQTT {
  private static readonly publicTopicsHash = env("MQTT_PUBLIC_TOPICS_HASH");

  private static readonly privateTopicsHash = env("MQTT_PRIVATE_TOPICS_HASH");

  public static MOBILE_NOTIFICATION_INVITE = (userId: string): string =>
    `/alarmouse/mqtt/sm/${this.publicTopicsHash}/notification/invite/${userId}`;

  public static ALL_PUB_CHANGE_DEVICE_STATUS = (macAddress: string): string =>
    `/alarmouse/mqtt/sall/${this.publicTopicsHash}/control/status/change/${macAddress}`;

  public static EMBEDDED_PUB_GET_CURRENT_DEVICE_STATUS = (
    macAddress: string
  ): string =>
    `/alarmouse/mqtt/se/${this.privateTopicsHash}/control/status/get/${macAddress}`;

  public static EMBEDDED_ERROR_AT_CREATE_DEVICE = (
    macAddress: string
  ): string =>
    `/alarmouse/mqtt/se/${this.privateTopicsHash}/control/error/create_device/${macAddress}`;

  public static ALL_DEVICE_DELETED = (macAddress: string): string =>
    `/alarmouse/mqtt/sall/${this.publicTopicsHash}/control/device/deleted/${macAddress}`;

  public static ALL_SUB_CHANGE_DEVICE_STATUS = `/alarmouse/mqtt/eall/${this.publicTopicsHash}/control/status/change`;

  public static EMBEDDED_SUB_GET_CURRENT_DEVICE_STATUS = `/alarmouse/mqtt/es/${this.privateTopicsHash}/control/status/get`;

  public static EMBEDDED_CHANGE_WIFI = `/alarmouse/mqtt/se/${this.privateTopicsHash}/control/wifi`;
}

export { TopicsMQTT };
