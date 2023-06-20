import { injectable, inject } from "inversify";

import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { capitalize } from "@helpers/capitalize";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { pagination } from "@helpers/pagination";
import { toNumber } from "@helpers/toNumber";
import {
  getMessage,
  getVariableMessage,
} from "@helpers/translatedMessagesControl";
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
    filters,
  }: ListAlarmEventsRequestModel): Promise<
    IPaginationResponse<ListAlarmEventsResponseModel>
  > {
    const statusConverted = ((): number | null => {
      if (!filters?.status) return null;

      const converted = toNumber({
        value: filters.status,
        error: getMessage("ErrorStatusInvalid"),
      });

      if (!(converted in DeviceStatusDomain))
        throw new AppError("BAD_REQUEST", getMessage("ErrorStatusOutOfDomain"));

      return converted;
    })();

    const startDate = ((): Date | null => {
      if (!filters?.date?.start) return null;

      if (!this.dateProvider.isValidISOString(filters.date.start))
        throw new AppError(
          "BAD_REQUEST",
          getVariableMessage("ErrorDateInvalid", [
            getMessage("RandomWord_StartDate"),
          ])
        );

      const [date, time] = filters.date.start.split("T");

      return this.dateProvider.getUTCDate(date, time || "00:00");
    })();

    const endDate = ((): Date | null => {
      if (!filters?.date?.end) return null;

      if (!this.dateProvider.isValidISOString(filters.date.end))
        throw new AppError(
          "BAD_REQUEST",
          getVariableMessage("ErrorDateInvalid", [
            getMessage("RandomWord_EndDate"),
          ])
        );

      const [date, time] = filters.date.end.split("T");

      return this.dateProvider.getUTCDate(date, time || "23:59");
    })();

    const whereOptions = {
      deviceId,
      filters: {
        status: statusConverted,
        date: {
          end: endDate,
          start: startDate,
        },
      },
    };

    if (startDate && endDate && this.dateProvider.isAfter(startDate, endDate))
      throw new AppError("BAD_REQUEST", getMessage("ErrorDateIntervalInvalid"));

    const countOperation = this.alarmEventsRepository.count(whereOptions);
    const getOperation = this.alarmEventsRepository.get(
      whereOptions,
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
