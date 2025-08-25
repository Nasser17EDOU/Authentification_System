import { formatInTimeZone } from "date-fns-tz";

export const dateFormattedInTZ = (date: Date): string => {
  try {
    // Try both UTC and local timezone to see which works
    const utcFormatted = formatInTimeZone(date, "UTC", "yyyy-MM-dd HH:mm:ss");
    const localFormatted = formatInTimeZone(date, Intl.DateTimeFormat().resolvedOptions().timeZone, "yyyy-MM-dd HH:mm:ss");
    
    console.log("Date formatting:", {
      original: date.toISOString(),
      utc: utcFormatted,
      local: localFormatted
    });
    
    return utcFormatted;
  } catch (error) {
    console.error("Date formatting error:", error);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  }
};