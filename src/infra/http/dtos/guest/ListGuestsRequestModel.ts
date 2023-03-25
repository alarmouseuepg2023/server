import { IPaginationOptions } from "@http/models/IPaginationOptions";

type ListGuestsRequestModel = IPaginationOptions & {
  deviceId: string;
};

export { ListGuestsRequestModel };
