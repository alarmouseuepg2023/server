import { container } from "@infra/containers";
import { logger } from "@infra/log";
import {
  ChangeWifiService,
  HandleDeviceTriggeredService,
} from "@services/device";

import { OnMQTTMessageCallback } from "../models/OnMQTTMessageCallback";

class DeviceMQTTController {
  public deviceTriggered: OnMQTTMessageCallback = async (payload) => {
    logger.info(
      "======================== MQTT SERVICE deviceTriggered ========================"
    );

    const service = container.resolve(HandleDeviceTriggeredService);

    await service.execute({
      deviceId: payload.toString(),
    });
  };

  public changeWifi: OnMQTTMessageCallback = async (payload) => {
    logger.info(
      "======================== MQTT SERVICE changeWifi ========================"
    );

    const service = container.resolve(ChangeWifiService);

    const { macAddress, ssid } = JSON.parse(payload.toString());

    await service.execute({
      macAddress,
      ssid,
    });
  };
}

export { DeviceMQTTController };
