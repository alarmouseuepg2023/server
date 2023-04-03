import { hash as bHash, compare as bCompare } from "bcryptjs";
import { injectable } from "inversify";

import { IHashProvider } from "../../models/IHashProvider";

@injectable()
class HashProvider implements IHashProvider {
  hash = async (payload: string, salt: number): Promise<string> =>
    bHash(payload, salt);

  compare = async (payload: string, hashed: string): Promise<boolean> =>
    bCompare(payload, hashed);
}

export { HashProvider };
