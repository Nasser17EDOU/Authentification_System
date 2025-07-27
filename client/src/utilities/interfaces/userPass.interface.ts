import type { BaseRecord, NewRecord, UpdateRecord } from "./base.interface";

export interface UserPass extends BaseRecord {
  user_pass_id: number;
  user_id: number;
  pass: string;
  is_curr: boolean;
  is_init: boolean;
}

// ======================
// New / Update DTO Types
// ======================

export type NewUserPass = Omit<
  UserPass,
  "user_pass_id" | "is_curr" | keyof NewRecord
>;
export type UserPassToUpdate = Omit<
  UserPass,
  "user_pass_id" | "is_curr" | keyof UpdateRecord
>;
