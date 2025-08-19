// src/services/profileServices.ts
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { CountResult } from "../../utils/interfaces/base.interface";
import { Profil } from "../../utils/interfaces/profil.interface";
import {
  superAdminProfileLib,
  withConnection,
  withTransaction,
} from "../../database/db_init";
import logger from "../../utils/logger.utils";
import { ProfilPermission } from "../../utils/interfaces/profilPermission.interface";
import { Permission } from "../../utils/interfaces/types.interface";
import { UserProfil } from "../../utils/interfaces/userProfil.interface";

const profileServices = {
  // Get all active profiles (excluding Super Admin)
  getAllProfilesServ: async (): Promise<Profil[]> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(Profil & RowDataPacket)[]>(
        `SELECT * FROM profils 
         WHERE is_delete = FALSE 
         AND UPPER(profil_lib) <> UPPER(?)
         ORDER BY profil_lib`,
        [superAdminProfileLib]
      );
      return rows;
    });
  },

  // Get profile by ID
  getProfileByIdServ: async (profil_id: number): Promise<Profil | null> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(Profil & RowDataPacket)[]>(
        `SELECT * FROM profils WHERE profil_id = ?`,
        [profil_id]
      );
      return rows[0] || null;
    });
  },

  // Get profile by lib
  getProfileByLibServ: async (profil_lib: string): Promise<Profil | null> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(Profil & RowDataPacket)[]>(
        `SELECT * FROM profils 
         WHERE profil_lib = ?`,
        [profil_lib]
      );
      return rows[0] || null;
    });
  },

  // Create new profile
  createProfileServ: async (
    profil_lib: string,
    createur_id: number
  ): Promise<number> => {
    return withTransaction(async (conn: PoolConnection) => {
      const [result] = await conn.query<ResultSetHeader>(
        `INSERT INTO profils SET ?`,
        [{ profil_lib, createur_id }]
      );
      const profil = {
        profil_id: result.insertId,
        ...{ profil_lib, createur_id },
      };
      logger.info("Profil creation", profil);
      return profil.profil_id;
    });
  },

  // Update profile
  updateProfileServ: async (
    profil_id: number,
    profil_lib: string,
    modifieur_id: number
  ): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      const [result] = await conn.query<ResultSetHeader>(
        `UPDATE profils SET ? WHERE profil_id = ?`,
        [{ profil_lib, modifieur_id }, profil_id]
      );
      const success = result.affectedRows > 0;
      logger.info(
        `Attemp to update profile (${profil_id}) ${
          success ? "" : "not"
        } succeed`,
        { profil_lib, modifieur_id }
      );
      return success;
    });
  },

  // Soft delete profile
  softDeleteProfileServ: async (
    profil_id: number,
    modifieur_id: number
  ): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      const [result] = await conn.query<ResultSetHeader>(
        `UPDATE profils SET ? 
         WHERE profil_id = ? AND is_delete = FALSE`,
        [
          {
            is_delete: true,
            modifieur_id,
          },
          profil_id,
        ]
      );
      const success = result.affectedRows > 0;
      logger.info(
        `Attemp to delete profile (${profil_id}) ${
          success ? "" : "not"
        } succeed`
      );
      return success;
    });
  },

  // Check if profile name exists
  profileExistsServ: async (
    profil_lib: string,
    exclude_profil_id: number | null = null
  ): Promise<boolean> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<CountResult[]>(
        `SELECT COUNT(*) as count FROM profils 
         WHERE UPPER(profil_lib) = UPPER(?)
         ${exclude_profil_id ? "AND profil_id <> ?" : ""}`,
        [profil_lib, ...(exclude_profil_id ? [exclude_profil_id] : [])]
      );
      return rows[0].count > 0;
    });
  },

  // Get all profile permissions
  getAllProfilePermissionsServ: async (): Promise<ProfilPermission[]> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(ProfilPermission & RowDataPacket)[]>(
        `
          SELECT pm.*
          FROM profil_permissions pm
          JOIN profils p ON p.profil_id = pm.profil_id
          WHERE p.is_delete = FALSE
          ORDER BY pm.permission
        `
      );

      return rows;
    });
  },

  // Get all permissions for a profile
  getAProfilePermissionsServ: async (
    profil_id: number
  ): Promise<Permission[]> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<
        ({ permission: Permission } & RowDataPacket)[]
      >(
        `SELECT DISTINCT permission 
         FROM profil_permissions 
         WHERE profil_id = ? 
         ORDER BY permission`,
        [profil_id]
      );
      return rows.map((row) => row.permission);
    });
  },

  // Update profile permissions (replace all)
  updateProfilePermissionsServ: async (
    permissions: Permission[],
    profil_id: number,
    modifieur_id: number
  ): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      // Delete existing permissions
      await conn.query(`DELETE FROM profil_permissions WHERE profil_id = ?`, [
        profil_id,
      ]);

      // Insert new permissions if any
      if (permissions.length > 0) {
        await conn.query(
          `INSERT INTO profil_permissions (profil_id, permission) VALUES ?`,
          [permissions.map((p) => [profil_id, p])]
        );
      }

      // Update profile modification info
      // await conn.query(
      //   `UPDATE profils SET ?
      //    WHERE profil_id = ?`,
      //   [
      //     {
      //       modifieur_id,
      //     },
      //     profil_id,
      //   ]
      // );

      logger.info(
        `${
          permissions.length === 0 ? "Deletion" : "Update"
        } of profile (${profil_id}) permissions by user(${modifieur_id})`,
        permissions
      );
      return true;
    });
  },

  // Get all profiles assigned to a user
  getAUserProfilesServ: async (user_id: number): Promise<Profil[]> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(Profil & RowDataPacket)[]>(
        `SELECT p.* 
         FROM profils p
         JOIN user_profils up ON up.profil_id = p.profil_id
         WHERE up.user_id = ? AND p.is_delete = FALSE
         ORDER BY p.profil_lib`,
        [user_id]
      );
      return rows;
    });
  },

  // Get all user profiles
  getAllUserProfilesServ: async (): Promise<UserProfil[]> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<(UserProfil & RowDataPacket)[]>(
        `SELECT up.* 
         FROM user_profils up
         JOIN profils p ON p.profil_id = up.profil_id
         JOIN users u ON u.user_id = up.user_id
         WHERE p.is_delete = FALSE AND u.is_delete = FALSE
         ORDER BY p.profil_lib`
      );
      return rows;
    });
  },

  // Update user's profiles (replace all)
  updateUserProfilesServ: async (
    user_id: number,
    profil_ids: number[],
    modifieur_id: number
  ): Promise<boolean> => {
    return withTransaction(async (conn: PoolConnection) => {
      // Delete existing permissions
      await conn.query(`DELETE FROM user_profils WHERE user_id = ?`, [user_id]);

      // Add new profiles if any
      if (profil_ids.length > 0) {
        await conn.query(
          `INSERT INTO user_profils (user_id, profil_id) VALUES ?`,
          [profil_ids.map((profil_id) => [user_id, profil_id])]
        );
      }

      // Update user modification info
      // await conn.query(
      //   `UPDATE users SET ?
      //    WHERE user_id = ?`,
      //   [
      //     {
      //       modifieur_id,
      //     },
      //     user_id,
      //   ]
      // );

      logger.info(
        `${
          profil_ids.length === 0 ? "Deletion" : "Update"
        } of user (${user_id}) profiles by user (${modifieur_id})`,
        profil_ids
      );
      return true;
    });
  },

  // Get all distinct permissions (grouped by permission) for a profile
  getDistinctPermissionsForUserServ: async (
    user_id: number
  ): Promise<Permission[]> => {
    return withConnection(async (conn: PoolConnection) => {
      const [rows] = await conn.query<
        ({ permission: Permission } & RowDataPacket)[]
      >(
        `
          SELECT DISTINCT pm.permission
          FROM profil_permissions pm
          JOIN user_profils up ON pm.profil_id = up.profil_id
          JOIN profils p ON p.profil_id = up.profil_id  -- Join to check profil deletion status
          WHERE up.user_id = ? 
            AND p.is_delete = FALSE  -- Ensure the profil itself is not deleted
          ORDER BY pm.permission
        `,
        [user_id]
      );

      return rows.map((row) => row.permission);
    });
  },
};

export default profileServices;
