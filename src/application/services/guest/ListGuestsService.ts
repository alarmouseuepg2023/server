import { inject, injectable } from "inversify";

import { capitalize } from "@helpers/capitalize";
import { pagination } from "@helpers/pagination";
import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { ListGuestsRequestModel } from "@infra/dtos/guest/ListGuestsRequestModel";
import { ListGuestsResponseModel } from "@infra/dtos/guest/ListGuestsResponseModel";
import { IDateProvider } from "@providers/date";
import { IMaskProvider } from "@providers/mask";

@injectable()
class ListGuestsService {
  constructor(
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider
  ) {}

  public async execute({
    deviceId,
    page,
    size,
  }: ListGuestsRequestModel): Promise<
    IPaginationResponse<ListGuestsResponseModel>
  > {
    const countOperation = this.deviceAccessControlRepository.countGuests({
      deviceId,
    });
    const getOperation = this.deviceAccessControlRepository.getGuests(
      { deviceId },
      pagination({ size, page })
    );

    const [totalItems, items] = await transaction([
      countOperation,
      getOperation,
    ]);

    return {
      items: items.map(
        ({ user: { id, email, name, invitee } }): ListGuestsResponseModel => ({
          id,
          email,
          name,
          answeredAt: {
            readableDate: capitalize(
              this.dateProvider.readableDate(invitee[0].answeredAt as Date)
            ),
            timestamp: this.maskProvider.timestamp(
              invitee[0].answeredAt as Date
            ),
          },
          invitedAt: {
            readableDate: capitalize(
              this.dateProvider.readableDate(invitee[0].invitedAt)
            ),
            timestamp: this.maskProvider.timestamp(invitee[0].invitedAt),
          },
        })
      ),
      totalItems,
    };
  }
}

export { ListGuestsService };
