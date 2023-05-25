import ptBR, {
  isAfter,
  format,
  isBefore,
  addMinutes,
  isEqual,
  subMinutes,
  parseISO,
  isValid,
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { injectable } from "inversify";

import { IDateProvider } from "@providers/date/models/IDateProvider";

const rtf = new Intl.RelativeTimeFormat("pt-br", {
  numeric: "auto",
});

@injectable()
class DateProvider implements IDateProvider {
  getUTCDate = (date: string, time?: string): Date =>
    zonedTimeToUtc(
      new Date(`${date}${time ? ` ${time}:00.000Z` : ""}`),
      "America/Sao_Paulo",
      { locale: ptBR }
    );

  now = (): Date => zonedTimeToUtc(new Date().toISOString(), "");

  getTodayWithoutTime = (): Date =>
    zonedTimeToUtc(`${format(this.now(), "yyyy-MM-dd")}`, "America/Sao_Paulo", {
      locale: ptBR,
    });

  isAfter = (date: Date, toCompare: Date): boolean => isAfter(date, toCompare);

  isBefore = (date: Date, toCompare: Date): boolean =>
    isBefore(date, toCompare);

  minuteToMilli = (minute: number): number => minute * 6000;

  differenceInMillis = (end: Date, start: Date): number =>
    end.getTime() - start.getTime();

  addMinutes = (date: Date, minutes: number): Date => addMinutes(date, minutes);

  subMinutes = (date: Date, minutes: number): Date => subMinutes(date, minutes);

  equals = (start: Date, end: Date): boolean => isEqual(start, end);

  isValidISOString = (date: string): boolean => isValid(parseISO(date));

  readableDate = (date: Date): string => {
    const now = this.now();
    const differenceInSeconds = Math.abs(
      this.differenceInMillis(now, date) / 1000
    );

    if (differenceInSeconds < 3600) {
      const difference = Math.floor(differenceInSeconds / 60);
      return rtf.format(-difference, "minute");
    }

    if (differenceInSeconds < 3600 * 24) {
      const difference = Math.floor(differenceInSeconds / 3600);
      return rtf.format(-difference, "hour");
    }

    if (differenceInSeconds < 3600 * 24 * 7) {
      const difference = Math.floor(differenceInSeconds / (3600 * 24));
      return rtf.format(-difference, "day");
    }

    if (differenceInSeconds < 3600 * 24 * 7 * 4) {
      const difference = Math.floor(differenceInSeconds / (3600 * 24 * 7));
      return rtf.format(-difference, "week");
    }

    if (differenceInSeconds < 3600 * 24 * 7 * 4 * 12) {
      const endMonth = now.getMonth();
      const startMonth = date.getMonth();

      const difference =
        endMonth + (endMonth < startMonth ? 12 : 0) - startMonth;
      return rtf.format(-difference, "month");
    }

    const difference = now.getFullYear() - date.getFullYear();
    return rtf.format(-difference, "year");
  };
}

export { DateProvider };
