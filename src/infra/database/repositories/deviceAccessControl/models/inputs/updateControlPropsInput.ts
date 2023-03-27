type updateControlPropsInput = {
  userId: string;
  deviceId: string;
  unlockAttempts: number;
  lastFailedUnlock: Date | null;
  blocked: boolean;
};

export { updateControlPropsInput };
