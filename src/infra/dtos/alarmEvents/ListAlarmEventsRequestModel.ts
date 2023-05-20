import { IPaginationOptions } from "@http/models/IPaginationOptions";

type ListAlarmEventsRequestModel = IPaginationOptions & {
  deviceId: string;
};

export { ListAlarmEventsRequestModel };
