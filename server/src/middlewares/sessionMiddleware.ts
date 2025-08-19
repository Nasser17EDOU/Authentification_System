import dotenv from "dotenv";
import { Response } from "express";
import { Session } from "express-session";

dotenv.config();

export const destroySession = (
  session: Session,
  res: Response
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    session.destroy((err) => {
      if (err) {
        return resolve(false); // Return false if session destruction failed
      }
      res.clearCookie(process.env.SESSION_NAME as string);
      resolve(true); // Return true if session destruction was successful
    });
  });
};
