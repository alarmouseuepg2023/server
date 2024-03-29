import { container } from "@infra/containers";
import { logger } from "@infra/log";
import {
  HandleDeviceChangedStatusService,
  HandleDeviceChangedWifiService,
  HandleFailedChangedStatusAttemptService,
  SynchronizeCurrentDeviceStatusService,
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

    const service = container.resolve(HandleDeviceChangedWifiService);

    const { macAddress, ssid } = JSON.parse(payload.toString());

    await service.execute({
      macAddress,
      ssid,
    });
  };

  public getCurrentStatus: OnMQTTMessageCallback = async (payload) => {
    logger.info(
      "======================== MQTT SERVICE getCurrentStatus ========================"
    );

    const service = container.resolve(SynchronizeCurrentDeviceStatusService);

    const { macAddress } = JSON.parse(payload.toString());

    await service.execute({
      macAddress,
    });
  };

  public failedChangedStatusAttempt: OnMQTTMessageCallback = async (
    payload
  ) => {
    logger.info(
      "======================== MQTT SERVICE failedChangedStatusAttempt ========================"
    );

    const service = container.resolve(HandleFailedChangedStatusAttemptService);

    const { macAddress, status } = JSON.parse(payload.toString());

    await service.execute({
      deviceId: macAddress,
      status,
    });
  };
}

export { DeviceMQTTController };
