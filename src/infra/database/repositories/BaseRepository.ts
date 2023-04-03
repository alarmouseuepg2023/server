import { injectable } from "inversify";

import { prismaClient } from "../client";

@injectable()
abstract class BaseRepository {
  constructor(protected prisma = prismaClient) {}
}

export { BaseRepository };
