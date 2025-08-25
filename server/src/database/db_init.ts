// src/utilities/db.ts
import dotenv from "dotenv";
import mysql, { PoolConnection, RowDataPacket } from "mysql2/promise";
import logger from "../utils/logger.utils";
import { Genre, Permission } from "../utils/interfaces/types.interface";
import path from "path";
import fs from "fs";
import { NewUser } from "../utils/interfaces/user.interface";
import bcrypt from "bcryptjs";
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

export const superAdminProfileLib =
  process.env.SUPER_ADMIN_PROFILE_LIB || "Super administrateur";

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
  dateStrings: false, //  Return dates as JavaScript Date objects
  connectAttributes: {
    session_time_zone: "+00:00", // Align with `timezone: "Z"`
    program_name: process.env.APP_NAME,
  },

  // -- Query Safety --
  namedPlaceholders: true, // Use `:name` instead of `?`
  decimalNumbers: true, // Return decimals as numbers (not strings)
  typeCast: (field, next) => {
    // Enhanced type casting
    switch (field.type) {
      case "DATETIME":
      case "TIMESTAMP":
      case "DATE":
        const val = field.string();
        // Convert to JS Date, preserving UTC
        return val ? new Date(val.replace(" ", "T")) : null;
      case "TINY":
        if (field.length === 1) return field.string() === "1"; // TINYINT(1) → boolean
        return next();
      default:
        return next();
    }
  },
  supportBigNumbers: true, // For safe BIGINT handling
  bigNumberStrings: false, // Return as numbers when safe

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
export async function withTransaction<T>(
  callback: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  return withConnection(async (conn) => {
    try {
      await conn.beginTransaction();
      const result = await callback(conn);
      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback();
      logger.error("Transaction failed:", error);
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
      const user_id = existing[0].user_id;

      // Destructure to exclude createur_id and prevent it from being updated
      const { createur_id, ...adminBaseData } = newSuperAdmin;

      // Prepare update data
      const dataToUpdate = {
        ...adminBaseData,
        is_active: true,
        is_delete: false,
        modifieur_id: user_id, // Using the existing user's ID as modifier
        mod_date: null, // Will auto-update to current timestamp
      };

      // Execute update
      await conn.query<mysql.ResultSetHeader>(
        `UPDATE users SET ? WHERE user_id = ?`,
        [dataToUpdate, user_id]
      );

      return { user_id };
    }

    const [result] = await conn.query<mysql.ResultSetHeader>(
      `INSERT INTO users SET ?`,
      [newSuperAdmin]
    );

    logger.info("Super admin user set successfully");
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
      await conn.query(`INSERT INTO pass_params SET ?`, [
        {
          pass_expir_day: 90,
          modifieur_id: adminId,
        },
      ]);
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

      await conn.query(`INSERT INTO user_pass SET ?`, [
        {
          user_id: adminId,
          pass: hashedPassword,
          is_init: true,
        },
      ]);
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
       WHERE UPPER(profil_lib) = UPPER(?) LIMIT 1`,
      [superAdminProfileLib]
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
      const [result] = await conn.query<mysql.ResultSetHeader>(
        `INSERT INTO profils SET ?`,
        [
          {
            profil_lib: superAdminProfileLib,
            createur_id: adminId,
          },
        ]
      );
      profileId = result.insertId;
      logger.info("Set super admin profile");
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
    const newProfilPermissions = permissions.map((permis) => ({
      profil_id: profileId,
      permission: permis,
    }));

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

    if (!(existingAssignment.length > 0)) {
      await conn.query(`INSERT INTO user_profils SET ?`, [
        {
          user_id: adminId,
          profil_id: profileId,
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
