interface IMaskProvider {
  removeMacAddress(macAddress: string): string;
  macAddress(macAddress: string): string;
  timestamp(date: Date): string;
}

export { IMaskProvider };
