import { AppError } from "@handlers/error/AppError";
import { logger } from "@infra/log";

import { getMessage } from "./translatedMessagesControl";

type envKeys =
  | "PORT"
  | "PASSWORD_HASH_SALT"
  | "SUPPORT_ID"
  | "LIST_ALLOWED_ORIGINS"
  | "JWT_SECRET_KEY"
  | "JWT_SECRET_KEY_REFRESH"
  | "MQTT_PORT"
  | "MQTT_HOST"
  | "MQTT_PASSWORD"
  | "MQTT_USERNAME"
  | "MQTT_PUBLIC_TOPICS_HASH"
  | "MQTT_PRIVATE_TOPICS_HASH"
  | "MAIL_PORT"
  | "MAIL_HOST"
  | "MAIL_AUTH_USERNAME"
  | "MAIL_AUTH_PASSWORD"
  | "MAIL_FROM"
  | "MAIL_CONFIGURED"
  | "NOTIFICATIONS_PROJECT_ID"
  | "NOTIFICATIONS_PRIVATE_KEY"
  | "NOTIFICATIONS_CLIENT_EMAIL";

const env = (key: envKeys, errorMessage = "ErrorEnvVarNotFound"): string => {
  const _env = process.env[key];

  if (!_env) {
    logger.error(`Access attempting to non-existing env var: ${key}`);

    throw new AppError("INTERNAL_SERVER_ERROR", getMessage(errorMessage));
  }

  return _env;
};

export { env, envKeys };
