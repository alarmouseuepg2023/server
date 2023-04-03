import {
  Result as PasswordStrengthResult,
  passwordStrength,
  DiversityType,
} from "check-password-strength";
import { injectable } from "inversify";
import { randomBytes } from "node:crypto";

import { arrayContainsArray } from "@helpers/arrayContainsArray";

import { IPasswordProvider } from "../models/IPasswordProvider";

@injectable()
class PasswordProvider implements IPasswordProvider {
  readonly MIN_LENGTH: number = 8;

  readonly MAX_LENGTH: number = 32;

  readonly IS_REQUIRED: DiversityType[] = ["lowercase", "uppercase", "number"];

  outOfBounds = (password: string): boolean =>
    password.length < this.MIN_LENGTH || password.length > this.MAX_LENGTH;

  hasStrength(password: string): boolean {
    const { contains: tokensInPasswd, id }: PasswordStrengthResult<number> =
      passwordStrength(password);

    if (id === 0) return false;

    return arrayContainsArray<string>(tokensInPasswd, this.IS_REQUIRED);
  }

  generatePin(): string {
    const buffer = randomBytes(3);
    const pin = buffer.readUIntBE(0, 3) % 1000000;
    return pin.toString().padStart(6, "0");
  }
}

export { PasswordProvider };
