import { CreateInviteRequestModel } from "@http/dtos/invite/CreateInviteRequestModel";

class CreateInviteService {
  public async execute({
    guestId,
    ownerId,
  }: CreateInviteRequestModel): Promise<void> {
    console.log(guestId, ownerId);
  }
}

export { CreateInviteService };
