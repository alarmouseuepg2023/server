type ListAlarmEventsResponseModel = {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

export { ListAlarmEventsResponseModel };
