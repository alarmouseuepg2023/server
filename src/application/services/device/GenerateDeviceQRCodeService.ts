import { inject, injectable } from "inversify";
import path from "node:path";

import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { getMessage } from "@helpers/translatedMessagesControl";
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
        getMessage("ErrorDeviceQrCodePinRequired")
      );

    if (!this.validatorsProvider.deviceSmartConfigPassword(pin))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorDeviceQrCodePinInvalid")
      );

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
        throw new AppError("BAD_REQUEST", getMessage("ErrorEmailInvalid"));

      await mailTransporter.sendMailAndWait({
        to: emailConverted,
        html: getMessage("MailSentDeviceQrCodeGeneratedHtml"),
        subject: getMessage("MailSentDeviceQrCodeGeneratedSubject"),
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
