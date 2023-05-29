import { env, envKeys } from "./env";
import { replaceAll } from "./replaceAll";

const envVarsLogRemoval = (message: string, vars: envKeys[]): string =>
  (vars as string[]).reduce(
    (acc, item) =>
      replaceAll({
        find: env(item as envKeys),
        replace: item,
        str: acc,
      }),
    message
  );

export { envVarsLogRemoval };
