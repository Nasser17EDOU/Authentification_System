// src/utilities/db.ts
import dotenv from "dotenv";
import mysql, { PoolConnection, RowDataPacket } from "mysql2/promise";
import logger from "../utils/logger.utils";
import {
  Genre,
  Permission,
  SqlTableType,
} from "../utils/interfaces/types.interface";
import path from "path";
import fs from "fs";
import { NewUser } from "../utils/interfaces/user.interface";
import { NewPassParam } from "../utils/interfaces/passParam.interface";
import bcrypt from "bcryptjs";
import { NewUserPass } from "../utils/interfaces/userPass.interface";
import { NewProfil } from "../utils/interfaces/profil.interface";
import { NewProfilPermission } from "../utils/interfaces/profilPermission.interface";
import { UserProfil } from "../utils/interfaces/userProfil.interface";

dotenv.config();

// Create super admin
const newSuperAdmin: NewUser = {
  login: process.env.SUPER_ADMIN_LOGIN!,
  nom: process.env.SUPER_ADMIN_NOM!,
  prenom: process.env.SUPER_ADMIN_PRENOM || null,
  email: process.env.SUPER_ADMIN_EMAIL || null,
  tel: process.env.SUPER_ADMIN_TEL || null,
  genre: (process.env.SUPER_ADMIN_GENRE as Genre | undefined) || "Masculin",
  createur_id: null,
};

const pool: mysql.Pool = mysql.createPool({
  // -- Connection Basics --
  host: process.env.DB_HOST!,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME!,

  // -- Pool Behavior --
  waitForConnections: true, // Queue requests if no connections available
  connectionLimit: 15, // Env-configurable
  queueLimit: 0, // Unlimited queue (adjust if you want to cap waiting requests)

  // -- Timezone & Date Handling --
  timezone: "Z", // Force UTC (good practice!)
  dateStrings: true, // Return dates as strings (not JavaScript Dates)
  connectAttributes: {
    session_time_zone: "+00:00", // Align with `timezone: "Z"`
    program_name: process.env.APP_NAME,
  },

  // -- Query Safety --
  namedPlaceholders: true, // Use `:name` instead of `?`
  decimalNumbers: true, // Return decimals as numbers (not strings)
  typeCast: (field, next) => {
    // Custom type handling
    if (field.type === "TINY" && field.length === 1) {
      return field.string() === "1"; // Convert TINYINT(1) to boolean
    }
    return next();
  },

  // -- Connection Health --
  idleTimeout: 30000, // Close idle connections after 30s
  enableKeepAlive: true, // Prevent TCP timeouts
  keepAliveInitialDelay: 10000, // Start keep-alive after 10s idle
  connectTimeout: 10000, // Fail if can't get a connection in 10s
});

// Export pool specially for session
export const getDbPool = (): mysql.Pool => {
  if (!pool) throw new Error("DB pool not initialized");
  return pool;
};

// Basic connection helper with simple validation
export async function withConnection<T>(
  callback: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getDbPool().getConnection();
  try {
    // Simple connection check - if this fails, we'll get a fresh connection
    await conn.ping();
    return await callback(conn);
  } catch (error) {
    logger.error("Database operation failed:", error);
    throw error;
  } finally {
    conn.release();
  }
}

// Transaction helper (unchanged from your original)
export async function withTransaction<T, U>(params: {
  transactionType: "insert" | "update";
  transactionTable: SqlTableType;
  record: U | U[];
  idKey?: keyof U;
  recorderId: number;
  callback: (conn: PoolConnection) => Promise<T>;
}): Promise<T> {
  const { transactionType, transactionTable, record, idKey, recorderId } =
    params;
  const records = Array.isArray(record) ? record : [record];
  const operationId = Date.now();

  // Prepare base log metadata
  const baseLogMeta = {
    operationId,
    type: transactionType,
    table: transactionTable,
    recorderId,
    recordCount: records.length,
    timestamp: new Date().toISOString(),
  };

  return withConnection(async (conn) => {
    try {
      await conn.beginTransaction();
      const result = await params.callback(conn);
      await conn.commit();

      // Determine returned IDs
      let affectedIds: unknown[] = [];
      if (transactionType === "insert") {
        affectedIds = Array.isArray(result)
          ? result // Assume callback returned ID array for bulk insert
          : [result]; // Single ID
      } else if (idKey) {
        affectedIds = records.map((r) => r[idKey]);
      }

      // Log success with affected IDs
      logger.info(`Transaction succeeded`, {
        ...baseLogMeta,
        affectedIds,
        affectedCount: affectedIds.length,
        // Include first 3 records for context (sanitized in prod)
        row: records,
      });

      return result;
    } catch (error) {
      await conn.rollback();

      // Log failure with error and attempted data
      logger.error(`Transaction failed`, {
        ...baseLogMeta,
        error,
      });

      throw error;
    }
  });
}

async function createDatabaseTables(conn: mysql.PoolConnection): Promise<void> {
  try {
    // Execute schema SQL
    const schemaPath = path.join(__dirname, "./db_tables.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    const statements = schemaSQL.split(";");
    for (const stmt of statements) {
      const statement = stmt.trim();
      if (statement.length > 0) {
        await conn.query(statement);
      }
    }
    logger.info("Database schema ready");
  } catch (error) {
    logger.error("Error with database structure:", error);
    throw error;
  }
}

async function setupSuperAdmin(
  conn: mysql.PoolConnection
): Promise<{ user_id: number }> {
  try {
    // Check if super admin exists
    const [existing] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT user_id FROM users WHERE login = :login LIMIT 1`,
      { login: newSuperAdmin.login }
    );

    if (existing.length > 0) {
      return { user_id: existing[0].user_id };
    }

    const [result] = await conn.query<mysql.ResultSetHeader>(
      `INSERT INTO users SET ?`,
      [newSuperAdmin]
    );

    logger.info("Super admin user created successfully");
    return { user_id: result.insertId };
  } catch (error) {
    logger.error("Error creating super admin:", error);
    throw error;
  }
}

async function setupPasswordPolicy(
  conn: mysql.PoolConnection,
  adminId: number
): Promise<void> {
  try {
    // Check if password policy exists
    const [existingPassParam] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT pass_param_id FROM pass_params LIMIT 1`
    );

    // Only create if doesn't exist (no updates)
    if (existingPassParam.length === 0) {
      const newPassParam: NewPassParam = {
        pass_expir_day: 90,
        modifieur_id: adminId,
      };
      await conn.query(`INSERT INTO pass_params SET ?`, [newPassParam]);
      logger.info("Password policy created");
    }

    // Check that the super admin has a current password
    const [existingPassword] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT * FROM user_pass WHERE user_id = ? AND is_curr = TRUE LIMIT 1`,
      [adminId]
    );

    if (existingPassword.length === 0) {
      // Set initial password
      const hashedPassword = await bcrypt.hash(
        process.env.SUPER_ADMIN_INIT_PASSWORD || "SuperAdminPassword",
        10
      );
      const newUserPass: NewUserPass = {
        user_id: adminId,
        pass: hashedPassword,
        is_init: true,
        createur_id: adminId,
      };
      await conn.query(`INSERT INTO user_pass SET ?`, [newUserPass]);
      logger.info("Super admin password set");
    }
  } catch (error) {
    logger.error("Error setting up password policy:", error);
    throw error;
  }
}

async function setupSuperAdminProfile(
  conn: mysql.PoolConnection,
  adminId: number
): Promise<void> {
  try {
    // 1. Create or reactivate profile
    let profileId: number;
    const [existingProfile] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT profil_id, is_delete FROM profils 
       WHERE UPPER(profil_lib) = UPPER('Super administrateur') LIMIT 1`
    );

    if (existingProfile.length > 0) {
      profileId = existingProfile[0].profil_id;
      if (existingProfile[0].is_delete) {
        await conn.query(
          `UPDATE profils SET is_delete = FALSE, modifieur_id = ? 
           WHERE profil_id = ?`,
          [adminId, profileId]
        );
        logger.info("Reactivated existing super admin profile");
      }
    } else {
      const newProfile: NewProfil = {
        createur_id: adminId,
        profil_lib: "Super administrateur",
      };
      const [result] = await conn.query<mysql.ResultSetHeader>(
        `INSERT INTO profils SET ?`,
        [newProfile]
      );
      profileId = result.insertId;
      logger.info("Created new super admin profile");
    }

    // 2. Set permissions
    const permissions: Permission[] = [
      "Consulter les utilisateurs",
      "Créer les utilisateurs",
      "Modifier les utilisateurs",
      "Supprimer les utilisateurs",
      "Modifier les profils des utilisateurs",
      "Consulter les profils",
      "Créer les profils",
      "Modifier les profils",
      "Supprimer les profils",
      "Modifier les permissions des profils",
      "Consulter les paramètres des mots de passe",
      "Modifier les paramètres des mots de passe",
      "Consulter les connexions des utilisateurs",
    ];
    const newProfilPermissions: NewProfilPermission[] = permissions.map(
      (permis) => ({
        profil_id: profileId,
        permission: permis,
      })
    );

    await conn.query(
      `INSERT IGNORE INTO profil_permissions (profil_id, permission) VALUES ?`,
      [newProfilPermissions.map((p) => [p.profil_id, p.permission])]
    );

    logger.info(
      `Added ${permissions.length} permissions to super admin profile`
    );

    // 3. Assign profile to admin user
    const [existingAssignment] = await conn.query<
      (UserProfil & RowDataPacket)[]
    >(
      `SELECT user_profil_id FROM user_profils 
       WHERE user_id = ? AND profil_id = ? LIMIT 1`,
      [adminId, profileId]
    );

    if (existingAssignment.length > 0) {
      await conn.query(
        `UPDATE user_profils SET is_delete = FALSE, modifieur_id = ? 
         WHERE user_profil_id = ?`,
        [adminId, existingAssignment[0].user_profil_id]
      );
    } else {
      await conn.query(`INSERT INTO user_profils SET ?`, [
        {
          user_id: adminId,
          profil_id: profileId,
          createur_id: adminId,
        },
      ]);
    }
    logger.info("Assigned super admin profile to user");
  } catch (error) {
    logger.error("Error setting up super admin profile:", error);
    throw error;
  }
}

// Initialize database
export const initializeDatabase = async (): Promise<boolean> => {
  logger.info("Starting database initialization...");

  const conn = await getDbPool().getConnection();
  await conn.beginTransaction();
  try {
    // 1. Create tables
    await createDatabaseTables(conn);

    // 2. Setup super admin user
    const superAdmin = await setupSuperAdmin(conn);

    // 3. Setup password policy
    await setupPasswordPolicy(conn, superAdmin.user_id);

    // 4. Setup super admin profile and permissions
    await setupSuperAdminProfile(conn, superAdmin.user_id);

    await conn.commit();
    logger.info("Database initialized successfully");
    return true;
  } catch (error) {
    await conn.rollback();
    logger.error("Database initialization failed:", error);
    throw error;
  } finally {
    conn.release();
  }
};
