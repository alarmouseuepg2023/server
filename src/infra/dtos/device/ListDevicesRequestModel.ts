import { IPaginationOptions } from "@http/models/IPaginationOptions";

type ListDevicesRequestModel = IPaginationOptions & {
  userId: string;
};

export { ListDevicesRequestModel };
