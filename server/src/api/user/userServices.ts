// src/services/userServices.ts
import dotenv from "dotenv";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { withConnection, withTransaction } from "../../database/db_init";
import {
  NewUser,
  User,
  UserToUpdate,
} from "../../utils/interfaces/user.interface";
import logger from "../../utils/logger.utils";
import { CountResult } from "../../utils/interfaces/base.interface";
import { Logging } from "../../utils/interfaces/logging.interface";

dotenv.config();

export const userServices = {
  // Get all active users (excluding super admin)
  getAllUsersServ: async (): Promise<User[]> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(User & RowDataPacket)[]>(
        `SELECT * FROM users 
         WHERE is_delete = FALSE 
         AND UPPER(login) <> UPPER(:login)
         ORDER BY login`,
        { login: process.env.SUPER_ADMIN_LOGIN! }
      );
      return rows; // Type assertion to User[]
    });
  },

  // Get user by ID
  getUserByIdServ: async (user_id: number): Promise<User | null> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(User & RowDataPacket)[]>(
        `SELECT * FROM users 
         WHERE user_id = ?`,
        [user_id]
      );
      return rows[0] || null; // Type assertion for the first row
    });
  },

  // Get user by login
  getUserByLoginServ: async (login: string): Promise<User | null> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(User & RowDataPacket)[]>(
        `SELECT * FROM users 
         WHERE UPPER(login) = UPPER(?)`,
        [login]
      );
      return rows[0] || null;
    });
  },

  // Create new user
  createUserServ: async (newUser: NewUser): Promise<number> => {
    return withTransaction(async (conn: PoolConnection) => {
      const [result] = await conn.query<ResultSetHeader>(
        `INSERT INTO users SET ?`,
        [newUser]
      );
      const user = { user_id: result.insertId, ...newUser };
      logger.info("User creation", user);
      return user.user_id;
    });
  },

  // Update user
  updateUserServ: async (userToUpdate: UserToUpdate): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      const [result] = await conn.query<ResultSetHeader>(
        `UPDATE users SET ? 
         WHERE user_id = ?`,
        [userToUpdate, userToUpdate.user_id]
      );
      const success = result.affectedRows > 0;
      logger.info(
        `Attemp to update user (${userToUpdate.user_id}) ${
          success ? "" : "not"
        } succeed`,
        userToUpdate
      );
      return success;
    });
  },

  // de/activate user
  changeUserStatusServ: async (
    user_id: number,
    is_active: boolean,
    modifieur_id: number
  ): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      const [result] = await conn.query<ResultSetHeader>(
        `UPDATE users SET ?
         WHERE user_id = ?`,
        [
          {
            is_active,
            modifieur_id,
          },
          user_id,
        ]
      );
      const success = result.affectedRows > 0;
      logger.info(
        `Attemp to ${
          is_active ? "activate" : "desactivate"
        } user (${user_id}) ${success ? "" : "not"} succeed`
      );
      return success;
    });
  },

  // Soft delete user
  softDeleteUserServ: async (
    user_id: number,
    modifieur_id: number
  ): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      const [result] = await conn.query<ResultSetHeader>(
        `UPDATE users SET ?
         WHERE user_id = ?`,
        [
          {
            is_delete: true,
            modifieur_id,
          },
          user_id,
        ]
      );
      const success = result.affectedRows > 0;
      logger.info(
        `Attemp to delete user (${user_id}) ${success ? "" : "not"} succeed`
      );
      return success;
    });
  },

  // Re-activate deleted user
  reactivateDeletedUserServ: async (
    user_id: number,
    modifieur_id: number
  ): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      const [result] = await conn.query<ResultSetHeader>(
        `UPDATE users SET ?
         WHERE user_id = ?`,
        [
          {
            is_delete: false,
            modifieur_id,
          },
          user_id,
        ]
      );
      const success = result.affectedRows > 0;
      logger.info(
        `Attemp to delete user (${user_id}) ${success ? "" : "not"} succeed`
      );
      return success;
    });
  },

  // Check if login exists
  loginExistsServ: async (
    login: string,
    exclude_user_id: number | null = null
  ): Promise<boolean> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<CountResult[]>(
        `SELECT COUNT(*) as count 
         FROM users 
         WHERE UPPER(login) = UPPER(?) 
         ${exclude_user_id ? "AND user_id <> ?" : ""}`,
        [login, ...(exclude_user_id ? [exclude_user_id] : [])]
      );
      return rows[0].count > 0;
    });
  },

  // get user active or delete status
  getUserActiveAndDeleteStatusServ: async (
    user_id: number
  ): Promise<{ is_active: boolean; is_delete: boolean } | null> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<
        ({ is_active: boolean; is_delete: boolean } & RowDataPacket)[]
      >(
        `SELECT is_active, is_delete FROM users 
         WHERE user_id = ?`,
        [user_id]
      );
      return rows[0] || null; // Type assertion for the first row
    });
  },

  // Check if email exists
  // emailExistsServ: async (
  //   email: string,
  //   exclude_user_id: number | null = null
  // ): Promise<boolean> => {
  //   return withConnection(async (conn: PoolConnection) => {
  //     const [rows] = await conn.query<CountResult[]>(
  //       `SELECT COUNT(*) as count
  //        FROM users
  //        WHERE email = ?
  //        ${exclude_user_id ? "AND user_id <> ?" : ""}`,
  //       [email, ...(exclude_user_id ? [exclude_user_id] : [])]
  //     );
  //     return rows[0].count > 0;
  //   });
  // },

  // Record a user logging time
  recordUserLoggingServ: async (user_id: number): Promise<number> => {
    return withTransaction(async (conn: PoolConnection) => {
      // Set all existing sessions for this user to inactive (without updating last_activ_time)
      await conn.query(
        `UPDATE loggings SET is_curr = FALSE 
        WHERE user_id = ? AND is_curr = TRUE`,
        [user_id]
      );

      const [result] = await conn.query<ResultSetHeader>(
        `INSERT INTO loggings SET ?`,
        [{ user_id }]
      );
      logger.info("User session loggin ", { user_id: result.insertId });
      return result.insertId;
    });
  },

  // Record a user latest activity time
  recordUserLatestActivTimeServ: async (
    user_id: number,
    is_curr = true // false in case of logout
  ): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      const [result] = await conn.query<ResultSetHeader>(
        `UPDATE loggings 
        SET last_activ_time = CURRENT_TIMESTAMP ${
          is_curr ? "" : ", is_curr = FALSE"
        } 
        WHERE user_id = ? AND is_curr = TRUE`,
        [user_id]
      );
      const success = result.affectedRows > 0;
      logger.info(
        `User (${user_id}) activity time ${
          success ? "updated" : "not updated - no active session"
        }`
      );
      return success;
    });
  },

  // fetch user loggings (excluding super admin)
  searchUserLoggingsServ: async (data: {
    dateDebut: Date | null;
    dateFin: Date | null;
    searchValue: string | null;
  }): Promise<
    (Logging & {
      login: User["login"];
      nom: User["nom"];
      prenom: User["prenom"];
    })[]
  > => {
    return withConnection(async (conn: PoolConnection) => {
      let query = `
      SELECT 
        l.logging_id, 
        l.user_id, 
        l.debut_logging, 
        l.last_activ_time,
        u.login,
        u.nom,
        u.prenom
      FROM loggings l
      JOIN users u ON l.user_id = u.user_id
      WHERE u.is_delete = FALSE
      AND u.login <> ?
    `;

      const queryParams: any[] = [process.env.SUPER_ADMIN_LOGIN!];

      // Date range filtering
      if (data.dateDebut || data.dateFin) {
        if (data.dateDebut && data.dateFin) {
          query += ` AND (
            (l.debut_logging BETWEEN ? AND ?) OR
            (l.last_activ_time BETWEEN ? AND ?) OR
            (l.debut_logging <= ? AND l.last_activ_time >= ?)
          )`;
          queryParams.push(
            data.dateDebut,
            data.dateFin, // debut between
            data.dateDebut,
            data.dateFin, // fin between
            data.dateDebut,
            data.dateFin // spans range
          );
        } else if (data.dateDebut) {
          query += ` AND (l.last_activ_time >= ? OR l.debut_logging >= ?)`;
          queryParams.push(data.dateDebut, data.dateDebut);
        } else if (data.dateFin) {
          query += ` AND (l.debut_logging <= ? OR l.last_activ_time <= ?)`;
          queryParams.push(data.dateFin, data.dateFin);
        }
      }

      // Search filtering
      if (data.searchValue) {
        query += ` AND (
        u.login LIKE ? OR 
        CONCAT(u.nom, ' ', IFNULL(u.prenom, '')) LIKE ? OR
        u.nom LIKE ? OR 
        u.prenom LIKE ?
      )`;
        const searchPattern = `%${data.searchValue}%`;
        queryParams.push(
          searchPattern,
          searchPattern,
          searchPattern,
          searchPattern
        );
      }

      query += ` ORDER BY l.debut_logging DESC`;

      const [rows] = await conn.query<
        (Logging & {
          login: User["login"];
          nom: User["nom"];
          prenom: User["prenom"];
        } & RowDataPacket)[]
      >(query, queryParams);

      return rows;
    });
  },
};
