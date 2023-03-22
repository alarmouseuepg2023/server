type DeviceAccessControlModel = {
  role: string;
  unlockAttempts: number;
  password: string;
  lastFailedUnlock: Date | null;
};

export { DeviceAccessControlModel };
