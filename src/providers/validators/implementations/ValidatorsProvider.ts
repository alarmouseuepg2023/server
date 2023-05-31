import { validate } from "email-validator";
import { injectable } from "inversify";

import { IValidatorsProvider } from "../models/IValidatorsProvider";

@injectable()
class ValidatorsProvider implements IValidatorsProvider {
  email = (email: string): boolean => validate(email);

  length = (str: string, length: number): boolean => str.length <= length;

  macAddress = (macAddress: string): boolean =>
    /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macAddress);

  devicePassword = (password: string): boolean => /^\d{6}$/.test(password);

  deviceSmartConfigPassword = (password: string): boolean =>
    /^\d{16}$/.test(password);
}

export { ValidatorsProvider };
