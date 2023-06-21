import { Domains } from "@domains/index";

import { getMessage } from "./translatedMessagesControl";

const getEnumDescription = (
  domain: keyof typeof Domains,
  key: string
): string => getMessage(`Domain${Domains[domain]}_${key}`);

export { getEnumDescription };
