import { inject, injectable } from "tsyringe";

import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { getUserType2External } from "@helpers/getUserType2External";
import { pagination } from "@helpers/pagination";
import { ListDevicesRequestModel } from "@http/dtos/device/ListDevicesRequestModel";
import { ListDevicesResponseModel } from "@http/dtos/device/ListDevicesResponseModel";
import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { transaction } from "@infra/database/transaction";
import { IMaskProvider } from "@providers/mask";

@injectable()
class ListDevicesService {
  constructor(
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public async execute({
    userId,
    page,
    size,
  }: ListDevicesRequestModel): Promise<
    IPaginationResponse<ListDevicesResponseModel>
  > {
    const countOperation = this.deviceRepository.count({ userId });
    const getOperation = this.deviceRepository.get(
      { userId },
      pagination({ size, page })
    );

    const [totalItems, items] = await transaction([
      countOperation,
      getOperation,
    ]);

    return {
      totalItems,
      items: items.map(
        ({
          id,
          DeviceAccessControl,
          macAddress,
          nickname,
          status,
          wifiSsid,
        }): ListDevicesResponseModel => ({
          id,
          nickname,
          role: getUserType2External(DeviceAccessControl[0].role),
          macAddress: this.maskProvider.macAddress(macAddress),
          status: getEnumDescription(
            "DEVICE_STATUS",
            DeviceStatusDomain[status]
          ),
          wifiSsid,
        })
      ),
    };
  }
}

export { ListDevicesService };