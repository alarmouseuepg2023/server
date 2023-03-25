interface IDateProvider {
  now(): Date;
  isBefore(date: Date, toCompare: Date): boolean;
  addMinutes(date: Date, hours: number): Date;
  getTodayWithoutTime(): Date;
  getUTCDate(date: string, time?: string): Date;
  isAfter(date: Date, toCompare: Date): boolean;
  minuteToMilli(minute: number): number;
  differenceInMillis(end: Date, start: Date): number;
  equals(start: Date, end: Date): boolean;
  readableDate(date: Date): string;
}

export { IDateProvider };
