import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { getMessage } from "@helpers/translatedMessagesControl";
import { IMiddleware } from "@http/models/IMiddleware";

const isSupportMiddleware: IMiddleware = async (req, _, next) => {
  try {
    const { support } = req.params;

    const id = env("SUPPORT_ID");

    if (!support || support === "" || id !== support)
      throw new AppError("UNAUTHORIZED", getMessage("ErrorOnlySupport"));
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(
      "INTERNAL_SERVER_ERROR",
      getMessage("ErrorGenericUnknown")
    );
  }

  return next();
};

export { isSupportMiddleware };
