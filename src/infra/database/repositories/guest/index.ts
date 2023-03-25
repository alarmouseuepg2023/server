import { IGuestRepository } from "./models/IGuestRepository";
import { GuestRepository } from "./models/implementations/PostgreSQL/Prisma/GuestRepository";

export { GuestRepository, IGuestRepository };
