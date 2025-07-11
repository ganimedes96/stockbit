import { isSameDay } from "date-fns";

export function isToday(date: Date) {
  return isSameDay(date, new Date());
}