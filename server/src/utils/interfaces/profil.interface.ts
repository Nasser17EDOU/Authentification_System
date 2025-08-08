import type { BaseRecord, NewRecord, UpdateRecord } from "./base.interface";

export interface Profil extends BaseRecord {
  profil_id: number;
  profil_lib: string;
}

// ======================
// New / Update DTO Types
// ======================

export type NewProfil = Omit<Profil, "profil_id" | keyof NewRecord>;
export type ProfilToUpdate = Omit<Profil, keyof UpdateRecord>;
