type GuestModel = {
  unlockAttempts: number;
  password: string;
  lastFailedUnlock?: Date;
};

export { GuestModel };
