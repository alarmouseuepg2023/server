import { Transporter, createTransport, SendMailOptions } from "nodemailer";

import { env } from "@helpers/env";
import { toNumber } from "@helpers/toNumber";
import { logger } from "@infra/log";

class MailTransporter {
  private transporter: Transporter;

  constructor() {
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
    logger.info(`Sending email to: ${mailOptions.to}`);

    this.transporter.sendMail({
      ...mailOptions,
      from: env("MAIL_FROM"),
    });
  }
}

export { MailTransporter };
