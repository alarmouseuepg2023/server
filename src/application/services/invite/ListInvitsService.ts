import { inject, injectable } from "inversify";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { pagination } from "@helpers/pagination";
import { ListInvitsRequestModel } from "@http/dtos/invite/ListInvitsRequestModel";
import { ListInvitsResponseModel } from "@http/dtos/invite/ListInvitsResponseModel";
import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IInviteRepository } from "@infra/database/repositories/invite";
import { transaction } from "@infra/database/transaction";
import { IDateProvider } from "@providers/date";
import { IMaskProvider } from "@providers/mask";

@injectable()
class ListInvitsService {
  constructor(
    @inject("InviteRepository")
    private inviteRepository: IInviteRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider
  ) {}

  public async execute({
    userId,
    page,
    size,
  }: ListInvitsRequestModel): Promise<
    IPaginationResponse<ListInvitsResponseModel>
  > {
    const date = this.dateProvider.subMinutes(
      this.dateProvider.now(),
      ConstantsKeys.MINUTES_TO_ANSWER_INVITE
    );

    const countOperation = this.inviteRepository.count({ userId, date });
    const getOperation = this.inviteRepository.get(
      { userId, date },
      pagination({ size, page })
    );

    const [totalItems, items] = await transaction([
      countOperation,
      getOperation,
    ]);

    return {
      items: items.map(
        ({ id, invitedAt, device, inviter }): ListInvitsResponseModel => ({
          id,
          device,
          inviter,
          invitedAt: this.maskProvider.timestamp(invitedAt),
        })
      ),
      totalItems,
    };
  }
}

export { ListInvitsService };
