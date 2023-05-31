import i18n from "i18n";
import { createReadStream, unlink, access, constants } from "node:fs";
import { promisify } from "node:util";

import { AppError } from "@handlers/error/AppError";
import { IMiddleware } from "@http/models/IMiddleware";
import { logger } from "@infra/log";

const downloadFileAndUnlinkMiddleware: IMiddleware = async (_, res) => {
  const { filePath } = res.locals;

  try {
    await promisify(access)(filePath, constants.F_OK);
  } catch (err: any) {
    logger.error(
      `Error at download file middleware (access file): ${err.message}`
    );
    throw new AppError(
      "INTERNAL_SERVER_ERROR",
      i18n.__("ErrorDownloadFileDoesNotExists")
    );
  }

  res.attachment(filePath);

  createReadStream(filePath)
    .pipe(res)
    .on("close", () => {
      unlink(filePath, (err) => {
        if (err) {
          logger.error(
            `Error at download file middleware (unlink): ${err.message}`
          );
        }
      });
    });
};

export { downloadFileAndUnlinkMiddleware };
