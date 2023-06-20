import { AppError } from "@handlers/error/AppError";

import { getMessage } from "./translatedMessagesControl";

const getErrorStackTrace = (error: unknown): string => {
  if (error instanceof Error) return error.stack || error.message;
  if (error instanceof AppError) return error.message;

  return getMessage("ErrorGenericUnknown");
};

export { getErrorStackTrace };
