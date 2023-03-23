import { inject, injectable } from "tsyringe";

import { pagination } from "@helpers/pagination";
import { ListInvitsRequestModel } from "@http/dtos/invite/ListInvitsRequestModel";
import { ListInvitsResponseModel } from "@http/dtos/invite/ListInvitsResponseModel";
import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IInviteRepository } from "@infra/database/repositories/invite";
import { transaction } from "@infra/database/transaction";
import { IMaskProvider } from "@providers/mask";

@injectable()
class ListInvitsService {
  constructor(
    @inject("InviteRepository")
    private inviteRepository: IInviteRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public async execute({
    userId,
    page,
    size,
  }: ListInvitsRequestModel): Promise<
    IPaginationResponse<ListInvitsResponseModel>
  > {
    const countOperation = this.inviteRepository.count({ userId });
    const getOperation = this.inviteRepository.get(
      { userId },
      pagination({ size, page })
    );

    const [totalItems, items] = await transaction([
      countOperation,
      getOperation,
    ]);

    console.log(items[0]);

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
