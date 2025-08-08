import type { BaseRecord, NewRecord, UpdateRecord } from "./base.interface";

export interface UserProfil extends BaseRecord {
  user_profil_id: number;
  user_id: number;
  profil_id: number;
}

// ======================
// New / Update DTO Types
// ======================

export type NewUserProfil = Omit<
  UserProfil,
  "user_profil_id" | keyof NewRecord
>;
export type UserProfilToUpdate = Omit<UserProfil, keyof UpdateRecord>;
