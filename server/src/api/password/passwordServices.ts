// src/services/passwordServices.ts
import bcrypt from "bcryptjs";
import { PassParam } from "../../utils/interfaces/passParam.interface";
import { withConnection, withTransaction } from "../../database/db_init";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import logger from "../../utils/logger.utils";
import { UserPass } from "../../utils/interfaces/userPass.interface";
import { addDays } from "date-fns";

const passwordServices = {
  // Get password parameters
  getPassParamServ: async (): Promise<PassParam | null> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(PassParam & RowDataPacket)[]>(
        "SELECT * FROM pass_params LIMIT 1"
      );
      return rows[0] || null;
    });
  },

  // Update password parameters
  updatePassParamServ: async (
    pass_expir_day: number,
    allow_past_pass: boolean,
    modifieur_id: number
  ): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      // Try update first
      const [updateResult] = await conn.query<ResultSetHeader>(
        "UPDATE pass_params SET ?",
        [{ pass_expir_day, allow_past_pass, modifieur_id }]
      );

      let success = updateResult.affectedRows > 0;

      // If no rows updated, insert new
      if (!success) {
        const [insertResult] = await conn.query<ResultSetHeader>(
          "INSERT INTO pass_params SET ?",
          [{ pass_expir_day, allow_past_pass, modifieur_id }]
        );
        success = insertResult.affectedRows > 0;
      }
      logger.info(
        `Attemp to update password parameters ${success ? "" : "not"} succeed`,
        { pass_expir_day, allow_past_pass, modifieur_id }
      );
      return success;
    });
  },

  // Get current password for user
  getCurrentUserPasswordServ: async (
    user_id: number
  ): Promise<UserPass | null> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(UserPass & RowDataPacket)[]>(
        `SELECT * FROM user_pass 
         WHERE user_id = ? AND is_curr = TRUE 
         ORDER BY create_date DESC LIMIT 1`,
        [user_id]
      );

      return rows[0] || null;
    });
  },

  // Get all passwords for user (history)
  getUserPasswordsServ: async (user_id: number): Promise<UserPass[]> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(UserPass & RowDataPacket)[]>(
        `SELECT * FROM user_pass 
         WHERE user_id = ? 
         ORDER BY create_date DESC`,
        [user_id]
      );
      return rows;
    });
  },

  // Create new password for user
  createUserPasswordServ: async (
    user_id: number,
    pass: string,
    is_init: boolean,
    createur_id: number
  ): Promise<number> => {
    return withTransaction(async (conn: PoolConnection) => {
      // Mark all previous passwords as not current
      await conn.query(
        `UPDATE user_pass SET is_curr = FALSE 
         WHERE user_id = ?`,
        [user_id]
      );

      // Insert new password
      const [result] = await conn.query<ResultSetHeader>(
        "INSERT INTO user_pass SET ?",
        [{ user_id, pass, is_init }]
      );

      logger.info(
        `Password ${
          is_init ? "initialization" : "definition"
        } of user (${user_id}) by user (${createur_id})`
      );

      return result.insertId;
    });
  },

  // Update user password
  updateCurrentPasswordServ: async (
    user_id: number,
    pass: string
  ): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      // Direct update without hashing
      const [result] = await conn.query<ResultSetHeader>(
        `UPDATE user_pass 
         SET ? 
         WHERE user_id = ? AND is_curr = TRUE`,
        [{ pass, is_init: false }, user_id]
      );
      logger.info(`Password update of user (${user_id})`);
      return result.affectedRows > 0;
    });
  },

  // Check if password exists in user's history
  // Check if password exists in user's history (with hashed password comparison)
  passwordInHistoryServ: async (
    user_id: number,
    newPassword: string
  ): Promise<boolean> => {
    return withConnection(async (conn: PoolConnection) => {
      // 1. Get all previous hashed passwords for this user
      const [rows] = await conn.query<RowDataPacket[]>(
        `SELECT pass FROM user_pass 
       WHERE user_id = ? 
       ORDER BY create_date DESC`,
        [user_id]
      );

      // 2. Compare new password with each hashed version
      for (const row of rows) {
        const isMatch = await bcrypt.compare(newPassword, row.pass);
        if (isMatch) {
          return true; // Password found in history
        }
      }

      return false; // Password not found in history
    });
  },

  // Get password expiration date for user
  getPasswordExpirationServ: async (user_id: number): Promise<Date | null> => {
    // Get password parameters first
    const params = await passwordServices.getPassParamServ();

    // Get current password
    const currentPass = await passwordServices.getCurrentUserPasswordServ(
      user_id
    );

    if (!currentPass) return null;

    // Calculate expiration
    return addDays(
      new Date(currentPass.create_date),
      params ? params.pass_expir_day : 90
    );
  },

  // Check if password is expired
  isPasswordExpiredServ: async (user_id: number): Promise<boolean> => {
    return withConnection(async (conn: PoolConnection) => {
      const expirationDate = await passwordServices.getPasswordExpirationServ(
        user_id
      );
      if (!expirationDate) return true;

      const [rows] = await conn.query<
        ({ is_expired: number } & RowDataPacket)[]
      >("SELECT NOW() > ? AS is_expired", [expirationDate]);

      return !!rows[0].is_expired; // Cast 0/1 to boolean
    });
  },

  // Check if initial password
  isInitialPasswordServ: async (user_id: number): Promise<boolean> => {
    return withConnection(async (conn: PoolConnection) => {
      const currentPass = await passwordServices.getCurrentUserPasswordServ(
        user_id
      );
      return currentPass ? currentPass.is_init : false;
    });
  },
};

export default passwordServices;
