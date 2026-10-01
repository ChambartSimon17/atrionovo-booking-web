import { DateTime } from "luxon";

export function restaurantDateTimeToISO(
  date,
  time,
  timezone,
) {
  return DateTime.fromISO(
    `${date}T${time}`,
    {
      zone: timezone,
    },
  ).toUTC().toISO();
}