import i18n from "i18n";
import { inject, injectable } from "inversify";

import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { HandleFailedChangedStatusAttemptRequestModel } from "@http/dtos/device/HandleFailedChangedStatusAttemptRequestModel";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { mailTransporter } from "@infra/mail";
import { IMaskProvider } from "@providers/mask";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class HandleFailedChangedStatusAttemptService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository,
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository
  ) {}

  public async execute({
    macAddress,
  }: HandleFailedChangedStatusAttemptRequestModel): Promise<void> {
    if (stringIsNullOrEmpty(macAddress))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorMacAddressRequired"));

    if (!this.validatorsProvider.macAddress(macAddress))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorMacAddressInvalid"));

    const macAddressFormatted = this.maskProvider.removeMacAddress(macAddress);

    const [hasMacAddress, hasDeviceAccessControl] = await transaction([
      this.deviceRepository.hasMacAddress({ macAddress: macAddressFormatted }),
      this.deviceAccessControlRepository.getOwnerByMacAddress({
        macAddress: macAddressFormatted,
      }),
    ]);

    if (!hasMacAddress)
      throw new AppError("NOT_FOUND", i18n.__("ErrorMacAddressNotFound"));

    if (!hasDeviceAccessControl)
      throw new AppError("NOT_FOUND", i18n.__("ErrorOwnerNotFound"));

    mailTransporter.sendMail({
      subject: i18n.__("MailSentFailedChangedStatusAttemptNotificationSubject"),
      to: hasDeviceAccessControl.user.email,
      html: i18n.__mf("MailSentFailedChangedStatusAttemptNotificationHtml", [
        hasDeviceAccessControl.device.nickname,
      ]),
    });
  }
}

export { HandleFailedChangedStatusAttemptService };
