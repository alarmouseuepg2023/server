import { injectable, inject } from "inversify";

import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { capitalize } from "@helpers/capitalize";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { pagination } from "@helpers/pagination";
import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IAlarmEventsRepository } from "@infra/database/repositories/alarmEvents";
import { transaction } from "@infra/database/transaction";
import { ListAlarmEventsRequestModel } from "@infra/dtos/alarmEvents/ListAlarmEventsRequestModel";
import { ListAlarmEventsResponseModel } from "@infra/dtos/alarmEvents/ListAlarmEventsResponseModel";
import { IDateProvider } from "@providers/date";
import { IMaskProvider } from "@providers/mask";

@injectable()
class ListAlarmEventsService {
  constructor(
    @inject("AlarmEventsRepository")
    private alarmEventsRepository: IAlarmEventsRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider
  ) {}

  public async execute({
    deviceId,
    size,
    page,
  }: ListAlarmEventsRequestModel): Promise<
    IPaginationResponse<ListAlarmEventsResponseModel>
  > {
    const countOperation = this.alarmEventsRepository.count({ deviceId });
    const getOperation = this.alarmEventsRepository.get(
      { deviceId },
      pagination({ size, page })
    );

    const [totalItems, items] = await transaction([
      countOperation,
      getOperation,
    ]);

    return {
      items: items.map(
        ({
          id,
          createdAt,
          message,
          user,
          currentStatus,
        }): ListAlarmEventsResponseModel => ({
          id,
          message,
          status: getEnumDescription(
            "DEVICE_STATUS",
            DeviceStatusDomain[currentStatus]
          ),
          createdAt: this.maskProvider.timestamp(createdAt),
          readableDate: capitalize(this.dateProvider.readableDate(createdAt)),
          user: user
            ? {
                id: user.id,
                name: user.name,
              }
            : undefined,
        })
      ),
      totalItems,
    };
  }
}

export { ListAlarmEventsService };
