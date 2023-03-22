import { ConstantsKeys } from "@commons/ConstantsKeys";
import { i18n } from "@config/i18n";
import { IPaginationOptions } from "@http/models/IPaginationOptions";

import { toNumber } from "./toNumber";

const pagination = ({
  size,
  page,
}: Partial<IPaginationOptions>): [number, number] => {
  const take = ((): number => {
    if (size) {
      const converted = Math.abs(
        toNumber({
          value: size,
          error: i18n.__("ErrorQueryTypecasting"),
        })
      );

      return converted > ConstantsKeys.MAX_PAGE_SIZE
        ? ConstantsKeys.MAX_PAGE_SIZE
        : converted;
    }

    return ConstantsKeys.PAGE_SIZE_DEFAULT;
  })();

  const skip = ((): number => {
    if (page) {
      const converted = toNumber({
        value: page,
        error: i18n.__("ErrorQueryTypecasting"),
      });

      return Math.abs(converted) * take;
    }

    return 0;
  })();

  return [take, skip];
};

export { pagination };
