import ptBR, { isAfter, format, isBefore, addMinutes, isEqual } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

import { IDateProvider } from "@providers/date/models/IDateProvider";

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
}

export { DateProvider };
