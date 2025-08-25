export interface Logging {
  logging_id: number;
  user_id: number;
  is_curr: boolean;
  debut_logging: Date;
  last_activ_time: Date | null;
}
