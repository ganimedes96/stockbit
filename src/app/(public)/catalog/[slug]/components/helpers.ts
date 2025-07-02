import { differenceInDays } from "date-fns";

const IS_NEW_THRESHOLD_DAYS = 7;
export const isProductNew = (createdAt: Date): boolean => {
  if (!createdAt) return false;
  return differenceInDays(new Date(), createdAt) <= IS_NEW_THRESHOLD_DAYS;
};