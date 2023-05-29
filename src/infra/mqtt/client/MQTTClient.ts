import mqtt from "mqtt";

import { env } from "@helpers/env";
import { envVarsLogRemoval } from "@helpers/envVarsLogRemoval";
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
      error:
        "Não foi possível completar a operação. Por favor, entre em contato com a equipe de desenvolvimento.",
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
    const topic2log = this.getLogMessage(topic);

    logger.info(`MQTT Publish at topic: ${topic2log}`);

    this.client.publish(topic, payload, (err) => {
      if (err)
        logger.error(
          `Error at MQTT publish at topic ${topic2log}: ${err.message}`
        );
    });
  }

  private getLogMessage = (message: string): string =>
    envVarsLogRemoval(message, [
      "MQTT_PRIVATE_TOPICS_HASH",
      "MQTT_PUBLIC_TOPICS_HASH",
    ]);

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
    const topic2log = this.getLogMessage(topic);

    if (!this.subscriptionsMap) {
      logger.error(
        `MQTT Client received message without subscription map: Topic ${topic2log}`
      );
      return;
    }

    const subscription = this.subscriptionsMap[topic];

    if (!subscription) {
      logger.error(
        `MQTT Client received message with incorrectly subscription map: Topic ${topic2log}`
      );
      return;
    }

    logger.info(`MQTT Client received message at ${topic2log}`);

    subscription.cb(payload).catch((e) => subscription.errorHandler(e));
  };
}

export { MQTTClient };
