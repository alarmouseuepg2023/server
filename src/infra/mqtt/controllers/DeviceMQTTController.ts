import { container } from "@infra/containers";
import { logger } from "@infra/log";
import {
  ChangeWifiService,
  HandleDeviceChangedStatusService,
} from "@services/device";

import { OnMQTTMessageCallback } from "../models/OnMQTTMessageCallback";

class DeviceMQTTController {
  public changedStatus: OnMQTTMessageCallback = async (payload) => {
    logger.info(
      "======================== MQTT SERVICE changedStatus ========================"
    );

    const service = container.resolve(HandleDeviceChangedStatusService);

    const { macAddress, status } = JSON.parse(payload.toString());

    await service.execute({
      deviceId: macAddress,
      status,
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
