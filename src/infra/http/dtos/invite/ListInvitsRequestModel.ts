import { IPaginationOptions } from "@http/models/IPaginationOptions";

type ListInvitsRequestModel = IPaginationOptions & {
  userId: string;
};

export { ListInvitsRequestModel };
