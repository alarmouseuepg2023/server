import { searchFilters } from "../../../models/inputs/getInput";

const clause2searchAlarmEventsWithFilters = (filters: searchFilters): any => [
  filters && filters.status !== null
    ? {
        currentStatus: filters.status,
      }
    : undefined,
  filters && filters.date.end !== null
    ? {
        createdAt: { lte: filters.date.end },
      }
    : undefined,
  filters && filters.date.start !== null
    ? {
        createdAt: { gte: filters.date.start },
      }
    : undefined,
];

export { clause2searchAlarmEventsWithFilters };
