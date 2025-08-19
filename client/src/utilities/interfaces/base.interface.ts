// Base interface for common fields
export interface BaseRecord {
  is_delete: boolean;
  create_date: Date;
  createur_id: number | null;
  mod_date: Date | null;
  modifieur_id: number | null;
}

// interface key to ignore for New Record
export interface NewRecord {
  is_delete: boolean;
  create_date: Date;
  mod_date: Date | null;
  modifieur_id: number | null;
}

// interface key to ignore for update Record
export interface UpdateRecord {
  is_delete: boolean;
  create_date: Date;
  createur_id: number | null;
  mod_date: Date | null;
}
