import { inject, injectable } from "tsyringe";

import { pagination } from "@helpers/pagination";
import { ListAlarmEventsRequestModel } from "@http/dtos/alarmEvents/ListAlarmEventsRequestModel";
import { ListAlarmEventsResponseModel } from "@http/dtos/alarmEvents/ListAlarmEventsResponseModel";
import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IAlarmEventsRepository } from "@infra/database/repositories/alarmEvents";
import { transaction } from "@infra/database/transaction";
import { IMaskProvider } from "@providers/mask";

@injectable()
class ListAlarmEventsService {
  constructor(
    @inject("AlarmEventsRepository")
    private alarmEventsRepository: IAlarmEventsRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
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
        ({ id, createdAt, message, user }): ListAlarmEventsResponseModel => ({
          id,
          message,
          createdAt: this.maskProvider.timestamp(createdAt),
          user: {
            id: user.id,
            name: user.name,
          },
        })
      ),
      totalItems,
    };
  }
}

export { ListAlarmEventsService };
