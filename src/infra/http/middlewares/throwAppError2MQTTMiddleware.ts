import { AppError } from "@handlers/error/AppError";
import { IMiddlewareWithError } from "@http/models/IMiddlewareWithError";
import { mqttClient } from "@infra/mqtt/client";

const throwAppError2MQTTMiddleware =
  (
    topic: string | ((mac: string) => string),
    macAddressBodyAttrName = "macAddress"
  ): IMiddlewareWithError =>
  async (err, req, _, next) => {
    if (!(err instanceof AppError)) return next();

    const { [`${macAddressBodyAttrName}`]: macAddress } = req.body;

    mqttClient.publish(
      typeof topic === "string" ? topic : topic(macAddress),
      Buffer.from(err.message)
    );

    throw err;
  };

export { throwAppError2MQTTMiddleware };
