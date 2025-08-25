import type { BaseRecord, NewRecord, UpdateRecord } from "./base.interface";
import type { Genre } from "./types.interface";

export interface User extends BaseRecord {
  user_id: number;
  login: string;
  nom: string;
  prenom: string | null;
  genre: Genre;
  email: string | null;
  tel: string | null;
  is_active: boolean;
}

// ======================
// New / Update DTO Types
// ======================

export type NewUser = Omit<
  User,
  "user_id" | "is_active" | "createur_id" | keyof NewRecord
>;
export type UserToUpdate = Omit<
  User,
  "is_active" | "modifieur_id" | keyof UpdateRecord
>;
