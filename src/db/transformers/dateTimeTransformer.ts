import { ValueTransformer } from "typeorm";
import { DateTime } from "luxon";

export class DateTimeTransformer implements ValueTransformer {
  to(value: DateTime): string | null {
    // Convert Luxon DateTime to ISO string for DB storage
    return value ? value.toISO() : null;
  }

  from(value: string): DateTime | null {
    // Convert DB string back to Luxon DateTime
    return value ? DateTime.fromISO(value) : null;
  }
}