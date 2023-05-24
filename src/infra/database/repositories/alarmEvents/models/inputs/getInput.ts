type getInput = {
  deviceId: string;
  filters: searchFilters;
};

type searchFilters = {
  status: number | null;
  date: { start: Date | null; end: Date | null };
} | null;

export { getInput, searchFilters };
