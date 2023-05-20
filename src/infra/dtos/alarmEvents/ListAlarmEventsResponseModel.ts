type ListAlarmEventsResponseModel = {
  id: string;
  message: string;
  createdAt: string;
  readableDate: string;
  status: string;
  user?: {
    id: string;
    name: string;
  };
};

export { ListAlarmEventsResponseModel };
