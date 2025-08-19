export interface PassParam {
  pass_param_id: number;
  pass_expir_day: number;
  allow_past_pass: boolean;
  mod_date: Date | null;
  modifieur_id: number | null;
}
