import { env } from "@helpers/env";

class TopicsMQTT {
  private static readonly publicTopicsHash = env("MQTT_PUBLIC_TOPICS_HASH");

  private static readonly privateTopicsHash = env("MQTT_PRIVATE_TOPICS_HASH");
}

export { TopicsMQTT };
