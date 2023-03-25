import { ListAlarmEventsRequestModel } from "@http/dtos/alarmEvents/ListAlarmEventsRequestModel";
import { ListAlarmEventsResponseModel } from "@http/dtos/alarmEvents/ListAlarmEventsResponseModel";
import { IPaginationResponse } from "@http/models/IPaginationResponse";

class ListAlarmEventsService {
  public async execute(
    obj: ListAlarmEventsRequestModel
  ): Promise<IPaginationResponse<ListAlarmEventsResponseModel>> {
    console.log(obj);

    return {
      items: [],
      totalItems: 0,
    };
  }
}

export { ListAlarmEventsService };
