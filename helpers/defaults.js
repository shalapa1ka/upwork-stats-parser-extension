export function getDefaultDates() {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  return {
    startDate: oneWeekAgo.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  };
}
