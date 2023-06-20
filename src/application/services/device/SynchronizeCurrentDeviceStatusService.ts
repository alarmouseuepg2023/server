import { inject, injectable } from "inversify";

import { TopicsMQTT } from "@commons/TopicsMQTT";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { getMessage } from "@helpers/translatedMessagesControl";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { transaction } from "@infra/database/transaction";
import { GetCurrentDeviceStatusRequestModel } from "@infra/dtos/device/GetCurrentDeviceStatusRequestModel";
import { mqttClient } from "@infra/mqtt/client";
import { IMaskProvider } from "@providers/mask";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class SynchronizeCurrentDeviceStatusService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public async execute({
    macAddress,
  }: GetCurrentDeviceStatusRequestModel): Promise<void> {
    if (stringIsNullOrEmpty(macAddress))
      throw new AppError("BAD_REQUEST", getMessage("ErrorMacAddressRequired"));

    if (!this.validatorsProvider.macAddress(macAddress))
      throw new AppError("BAD_REQUEST", getMessage("ErrorMacAddressInvalid"));

    const macAddressFormatted = this.maskProvider.removeMacAddress(macAddress);

    const [hasMacAddress] = await transaction([
      this.deviceRepository.hasMacAddress({ macAddress: macAddressFormatted }),
    ]);

    if (!hasMacAddress)
      throw new AppError("NOT_FOUND", getMessage("ErrorMacAddressNotFound"));

    mqttClient.publish(
      TopicsMQTT.EMBEDDED_PUB_GET_CURRENT_DEVICE_STATUS(
        this.maskProvider.macAddress(hasMacAddress.macAddress)
      ),
      Buffer.from(`${hasMacAddress.status}`)
    );
  }
}

export { SynchronizeCurrentDeviceStatusService };
