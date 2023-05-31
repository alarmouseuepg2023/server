import i18n from "i18n";
import { inject, injectable } from "inversify";
import path from "node:path";

import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { GenerateDeviceQRCodeRequestModel } from "@infra/dtos/device/GenerateDeviceQRCodeRequestModel";
import { mailTransporter } from "@infra/mail";
import { IDateProvider } from "@providers/date";
import { IQRCodeProvider } from "@providers/qrcode";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class GenerateDeviceQRCodeService {
  constructor(
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("QRCodeProvider")
    private qrcodeProvider: IQRCodeProvider
  ) {}

  public async execute({
    pin,
    email,
  }: GenerateDeviceQRCodeRequestModel): Promise<string> {
    if (stringIsNullOrEmpty(pin))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorDeviceQrCodePinRequired")
      );

    if (!this.validatorsProvider.deviceSmartConfigPassword(pin))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceQrCodePinInvalid"));

    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "temp",
      `${this.dateProvider.now().getTime()}-qrcode.png`
    );

    await this.qrcodeProvider.generateQRCodeFile(filePath, pin);

    if (email) {
      const emailConverted = `${email}`;

      if (!this.validatorsProvider.email(emailConverted))
        throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailInvalid"));

      await mailTransporter.sendMailAndWait({
        to: emailConverted,
        html: i18n.__("MailSentDeviceQrCodeGeneratedHtml"),
        subject: i18n.__("MailSentDeviceQrCodeGeneratedSubject"),
        attachments: [
          {
            path: filePath,
            filename: "alarmouse_qrcode.png",
          },
        ],
      });
    }

    return filePath;
  }
}

export { GenerateDeviceQRCodeService };
