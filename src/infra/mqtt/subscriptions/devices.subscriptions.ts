import { TopicsMQTT } from "@commons/TopicsMQTT";

import { mqttClient } from "../client";
import { DeviceMQTTController } from "../controllers/DeviceMQTTController";
import { MQTTErrorHandlerMiddleware } from "../middlewares/MQTTErrorHandlerMiddleware";

const controller = new DeviceMQTTController();

const devicesSubscriptions = (): void => {
  mqttClient.subscribe({
    [`${TopicsMQTT.EMBEDDED_DEVICE_TRIGGERED}`]: {
      qos: 2,
      cb: controller.deviceTriggered,
      errorHandler: MQTTErrorHandlerMiddleware,
    },
    [`${TopicsMQTT.EMBEDDED_CHANGE_WIFI}`]: {
      qos: 2,
      cb: controller.changeWifi,
      errorHandler: MQTTErrorHandlerMiddleware,
    },
  });
};

export { devicesSubscriptions };
