import { validate } from "email-validator";

import { IValidatorsProvider } from "../models/IValidatorsProvider";

class ValidatorsProvider implements IValidatorsProvider {
  email = (email: string): boolean => validate(email);

  length = (str: string, length: number): boolean => str.length <= length;
}

export { ValidatorsProvider };
