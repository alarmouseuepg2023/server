import i18n from "i18n";
import mqtt from "mqtt";

import { env } from "@helpers/env";
import { toNumber } from "@helpers/toNumber";
import { logger } from "@infra/log";

import { IMqttSubscriptionMap } from "../models/IMqttSubscriptionMap";

class MQTTClient {
  private client: mqtt.MqttClient;

  private subscriptionsMap: IMqttSubscriptionMap | null = null;

  private options: mqtt.IClientOptions = {
    host: env("MQTT_HOST"),
    port: toNumber({
      value: env("MQTT_PORT"),
      error: i18n.__("ErrorEnvVarNotFound"),
    }),
    password: env("MQTT_PASSWORD"),
    username: env("MQTT_USERNAME"),
  };

  constructor() {
    this.client = mqtt.connect(this.options);

    this.client.on("error", this.onErrorCb);
    this.client.on("message", this.onMessageCb);
    this.client.on("connect", this.onConnectCb);
    this.client.on("disconnect", this.onDisconnectCb);
  }

  public isConnected = (): boolean => this.client.connected;

  public subscribe = (topics: IMqttSubscriptionMap): void => {
    this.subscriptionsMap = topics;
    this.client.subscribe(topics);
  };

  public publish(topic: string, payload: string | Buffer): void {
    logger.info(`MQTT Publish at topic: ${topic}`);

    this.client.publish(topic, payload, (err) => {
      if (err)
        logger.error(`Error at MQTT publish at topic ${topic}: ${err.message}`);
    });
  }

  private onConnectCb = () => {
    logger.info(
      `MQTT Client connected -> Host: ${this.options.host} / Port: ${this.options.port}`
    );
  };

  private onDisconnectCb = () => {
    logger.info(
      `MQTT Client disconnected -> Host: ${this.options.host} / Port: ${this.options.port}`
    );
  };

  private onErrorCb = (err: Error) => {
    logger.error(
      `MQTT Client error -> Host: ${this.options.host} / Port: ${this.options.port}: ${err.message}`
    );
  };

  private onMessageCb: mqtt.OnMessageCallback = (topic, payload) => {
    if (!this.subscriptionsMap) {
      logger.error(
        `MQTT Client received message without subscription map: Topic ${topic}`
      );
      return;
    }

    const subscription = this.subscriptionsMap[topic];

    if (!subscription) {
      logger.error(
        `MQTT Client received message with incorrectly subscription map: Topic ${topic}`
      );
      return;
    }

    logger.info(`MQTT Client received message at ${topic}`);

    subscription.cb(payload);
  };
}

export { MQTTClient };
