type saveInput = {
  id: string;
  deviceId: string;
  userId: string | null;
  message: string;
  createdAt: Date;
  currentStatus: number;
};

export { saveInput };
