export interface Logging {
  logging_id: number;
  user_id: number;
  debut_logging: string;
  fin_logging: string | null;
}

// ======================
// New / Update DTO Types
// ======================

export type NewLogging = Omit<
  Logging,
  "logging_id" | "debut_logging" | "fin_logging"
>;
export type LoggingToUpdate = Omit<
  Logging,
  "logging_id" | "debut_logging" | "fin_logging"
>;
