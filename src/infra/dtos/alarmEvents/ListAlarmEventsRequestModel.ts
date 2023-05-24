import { IPaginationOptions } from "@http/models/IPaginationOptions";

type ListAlarmEventsRequestModel = IPaginationOptions<{
  status?: string;
  date?: {
    start?: string;
    end?: string;
  };
}> & {
  deviceId: string;
};

export { ListAlarmEventsRequestModel };
