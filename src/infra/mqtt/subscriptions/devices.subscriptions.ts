import { TopicsMQTT } from "@commons/TopicsMQTT";

import { mqttClient } from "../client";
import { DeviceMQTTController } from "../controllers/DeviceMQTTController";

const controller = new DeviceMQTTController();

const devicesSubscriptions = (): void => {
  mqttClient.subscribe({
    [`${TopicsMQTT.EMBEDDED_DEVICE_TRIGGERED}`]: {
      qos: 2,
      cb: controller.deviceTriggered,
    },
    [`${TopicsMQTT.EMBEDDED_CHANGE_WIFI}`]: {
      qos: 2,
      cb: controller.changeWifi,
    },
  });
};

export { devicesSubscriptions };
