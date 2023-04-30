import { TopicsMQTT } from "@commons/TopicsMQTT";

import { mqttClient } from "../client";
import { DeviceMQTTController } from "../controllers/DeviceMQTTController";
import { MQTTErrorHandlerMiddleware } from "../middlewares/MQTTErrorHandlerMiddleware";

const controller = new DeviceMQTTController();

const devicesSubscriptions = (): void => {
  mqttClient.subscribe({
    [`${TopicsMQTT.EMBEDDED_SUB_CHANGE_DEVICE_STATUS}`]: {
      qos: 2,
      cb: controller.changedStatus,
      errorHandler: MQTTErrorHandlerMiddleware,
    },
    [`${TopicsMQTT.EMBEDDED_CHANGE_WIFI}`]: {
      qos: 2,
      cb: controller.changeWifi,
      errorHandler: MQTTErrorHandlerMiddleware,
    },
    [`${TopicsMQTT.EMBEDDED_SUB_GET_CURRENT_DEVICE_STATUS}`]: {
      qos: 2,
      cb: controller.getCurrentStatus,
      errorHandler: MQTTErrorHandlerMiddleware,
    },
  });
};

export { devicesSubscriptions };
