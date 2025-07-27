// Base interface for common fields
export interface BaseRecord {
  is_delete: boolean;
  create_date: string;
  createur_id: number | null;
  mod_date: string | null;
  modifieur_id: number | null;
}

// interface key to ignore for New Record
export interface NewRecord {
  is_delete: boolean;
  create_date: string;
  mod_date: string | null;
  modifieur_id: number | null;
}

// interface key to ignore for update Record
export interface UpdateRecord {
  create_date: string;
  createur_id: number | null;
  mod_date: string | null;
}
