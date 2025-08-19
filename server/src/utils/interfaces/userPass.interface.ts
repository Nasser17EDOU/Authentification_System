export interface UserPass {
  user_pass_id: number;
  user_id: number;
  pass: string;
  is_curr: boolean;
  is_init: boolean;
  create_date: Date;
}
