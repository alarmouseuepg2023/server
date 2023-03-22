interface IMaskProvider {
  removeMacAddress(macAddress: string): string;
  macAddress(macAddress: string): string;
}

export { IMaskProvider };
