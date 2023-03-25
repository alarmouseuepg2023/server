import { BaseRepository } from "@infra/database/repositories/BaseRepository";

import { IGuestRepository } from "../../../IGuestRepository";

class GuestRepository extends BaseRepository implements IGuestRepository {}
export { GuestRepository };
