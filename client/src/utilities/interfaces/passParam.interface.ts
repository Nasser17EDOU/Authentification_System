export interface PassParam {
  pass_param_id: number;
  pass_expir_day: number;
  allow_past_pass: boolean;
  mod_date: string | null;
  modifieur_id: number | null;
}

// ======================
// New / Update DTO Types
// ======================

export type NewPassParam = Omit<
  PassParam,
  "pass_param_id" | "allow_past_pass" | "mod_date"
>;
export type PassParamToUpdate = Omit<PassParam, "mod_date">;
