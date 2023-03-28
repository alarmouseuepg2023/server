import { BaseRepository } from "@infra/database/repositories/BaseRepository";

import { IWaitingEmailConfirmationRepository } from "../../../models/IWaitingEmailConfirmationRepository";

class WaitingEmailConfirmationRepository
  extends BaseRepository
  implements IWaitingEmailConfirmationRepository {}

export { WaitingEmailConfirmationRepository };
