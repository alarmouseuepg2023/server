interface IValidatorsProvider {
  email(email: string): boolean;
  length(str: string, length: number): boolean;
  macAddress(macAddress: string): boolean;
}

export { IValidatorsProvider };
