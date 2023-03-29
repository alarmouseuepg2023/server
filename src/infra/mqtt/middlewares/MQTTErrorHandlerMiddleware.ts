import { AppError } from "@handlers/error/AppError";
import { logger } from "@infra/log";

import { MQTTErrorHandler } from "../models/MQTTErrorHandler";

const MQTTErrorHandlerMiddleware: MQTTErrorHandler = (e) => {
  if (e instanceof AppError) {
    logger.error(
      `An error occurred at MQTT Service: ${e.message} with ${e.statusCode} status code`
    );
    return;
  }

  logger.error(`Unknown error at MQTT Service: ${e.message}`);
};

export { MQTTErrorHandlerMiddleware };
