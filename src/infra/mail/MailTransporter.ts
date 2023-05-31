import { Transporter, createTransport, SendMailOptions } from "nodemailer";

import { env } from "@helpers/env";
import { toNumber } from "@helpers/toNumber";
import { logger } from "@infra/log";

class MailTransporter {
  private transporter: Transporter;

  private configured2send: boolean;

  constructor() {
    this.configured2send = env("MAIL_CONFIGURED") === "true";
    this.transporter = createTransport({
      host: env("MAIL_HOST"),
      port: toNumber({
        value: env("MAIL_PORT"),
        error: "erro",
      }),
      auth: {
        user: env("MAIL_AUTH_USERNAME"),
        pass: env("MAIL_AUTH_PASSWORD"),
      },
    });
  }

  public sendMail(mailOptions: Exclude<SendMailOptions, "from">): void {
    if (!this.configured2send) return;

    logger.info(`Sending email to: ${mailOptions.to}`);

    this.transporter.sendMail({
      ...mailOptions,
      from: env("MAIL_FROM"),
    });
  }

  public async sendMailAndWait(
    mailOptions: Exclude<SendMailOptions, "from">
  ): Promise<void> {
    if (!this.configured2send) return;

    logger.info(`Sending email to: ${mailOptions.to} and waiting`);

    await this.transporter.sendMail({
      ...mailOptions,
      from: env("MAIL_FROM"),
    });
  }
}

export { MailTransporter };
