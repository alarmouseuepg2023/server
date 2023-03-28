import { container } from "tsyringe";

import { AppError } from "@handlers/error/AppError";
import { logger } from "@infra/log";
import { HandleDeviceTriggeredService } from "@services/device";

import { OnMQTTMessageCallback } from "../models/OnMQTTMessageCallback";

class DeviceMQTTController {
  public deviceTriggered: OnMQTTMessageCallback = async (payload) => {
    logger.info(
      "======================== MQTT SERVICE deviceTriggered ========================"
    );

    try {
      const service = container.resolve(HandleDeviceTriggeredService);

      await service.execute({
        deviceId: payload.toString(),
      });
    } catch (e: any) {
      if (e instanceof AppError) {
        logger.error(
          `An error occurred at MQTT Service: ${e.message} with ${e.statusCode} status code`
        );
        return;
      }

      logger.error(`Unknown error at MQTT Service: ${e.message}`);
    }
  };
}

export { DeviceMQTTController };