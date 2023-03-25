import ptBR, { isAfter, format, isBefore, addMinutes, isEqual } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

import { IDateProvider } from "@providers/date/models/IDateProvider";

const rtf = new Intl.RelativeTimeFormat("pt-br", {
  numeric: "auto",
});

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

  addMinutes = (date: Date, hours: number): Date => addMinutes(date, hours);

  equals = (start: Date, end: Date): boolean => isEqual(start, end);

  readableDate = (date: Date): string => {
    const now = this.now();
    const differenceInSeconds = this.differenceInMillis(now, date) / 1000;

    if (differenceInSeconds < 3600) {
      const difference = now.getMinutes() - date.getMinutes();
      return rtf.format(-difference, "minute");
    }

    if (differenceInSeconds < 3600 * 24) {
      const difference = now.getHours() - date.getHours();
      return rtf.format(-difference, "hour");
    }

    if (differenceInSeconds < 3600 * 24 * 7) {
      const difference = now.getDate() - date.getDate();
      return rtf.format(-difference, "day");
    }

    if (differenceInSeconds < 3600 * 24 * 7 * 4) {
      const difference = Math.floor((now.getDate() - date.getDate()) / 7);
      return rtf.format(-difference, "week");
    }

    if (differenceInSeconds < 3600 * 24 * 7 * 4 * 12) {
      const endMonth = now.getMonth();
      const startMonth = date.getMonth();

      const difference =
        now.getMonth() + (endMonth < startMonth ? 12 : 0) - date.getMonth();

      return rtf.format(-difference, "month");
    }

    const difference = now.getFullYear() - date.getFullYear();
    return rtf.format(-difference, "year");
  };
}

export { DateProvider };
