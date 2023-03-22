import { BaseRepository } from "@infra/database/repositories/BaseRepository";

import { IInviteRepository } from "../../../models/IInviteRepository";

class InviteRepository extends BaseRepository implements IInviteRepository {}

export { InviteRepository };
