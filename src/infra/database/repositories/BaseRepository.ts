import { prismaClient } from "../client";

abstract class BaseRepository {
  constructor(protected prisma = prismaClient) {}
}

export { BaseRepository };
