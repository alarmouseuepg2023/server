type DeviceAccessControlModel = {
  role: string;
  unlockAttempts: number;
  password: string;
  blocked: boolean;
  lastFailedUnlock: Date | null;
};

export { DeviceAccessControlModel };
