import { AppError } from "@handlers/error/AppError";
import { IMiddlewareWithError } from "@http/models/IMiddlewareWithError";
import { mqttClient } from "@infra/mqtt/client";
import { IThrowAppError2MQTT } from "@infra/mqtt/models/IThrowAppError2MQTT";

const throwAppError2MQTTMiddleware =
  (
    topic: string | ((mac: string) => string),
    macAddressBodyAttrName = "macAddress"
  ): IMiddlewareWithError =>
  async (err, req, _, __) => {
    if (!(err instanceof AppError)) throw err;

    if (!err.content || !(err.content as IThrowAppError2MQTT).__throwError)
      throw err;

    const { [`${macAddressBodyAttrName}`]: macAddress } = req.body;

    mqttClient.publish(
      typeof topic === "string" ? topic : topic(macAddress),
      Buffer.from(err.message)
    );

    throw err;
  };

export { throwAppError2MQTTMiddleware };
