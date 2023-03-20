interface IValidatorsProvider {
  email(email: string): boolean;
  length(str: string, length: number): boolean;
}

export { IValidatorsProvider };
