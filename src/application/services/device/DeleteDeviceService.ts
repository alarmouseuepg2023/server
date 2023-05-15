import i18n from "i18n";
import { inject, injectable } from "inversify";

import { TopicsMQTT } from "@commons/TopicsMQTT";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { DeleteDeviceRequestModel } from "@http/dtos/device/DeleteDeviceRequestModel";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { transaction } from "@infra/database/transaction";
import { mqttClient } from "@infra/mqtt/client";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class DeleteDeviceService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public async execute({
    deviceId,
  }: DeleteDeviceRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceIdRequired"));

    if (!this.uniqueIdentifierProvider.isValid(deviceId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [hasDevice] = await transaction([
      this.deviceRepository.getById({ deviceId }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", i18n.__("ErrorDeviceNotFound"));

    const [deleted] = await transaction([
      this.deviceRepository.delete({
        id: deviceId,
      }),
    ]);

    mqttClient.publish(
      TopicsMQTT.ALL_DEVICE_DELETED(
        this.maskProvider.macAddress(hasDevice.macAddress)
      ),
      Buffer.from("deleted")
    );

    return !!deleted;
  }
}

export { DeleteDeviceService };
