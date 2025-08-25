-- Users table
CREATE TABLE
    IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        login VARCHAR(15) UNIQUE NOT NULL,
        nom VARCHAR(50) NOT NULL,
        prenom VARCHAR(50) DEFAULT NULL,
        genre ENUM ('Masculin', 'Féminin') NOT NULL,
        email VARCHAR(100) DEFAULT NULL,
        tel VARCHAR(15) DEFAULT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_delete BOOLEAN NOT NULL DEFAULT FALSE,
        create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        createur_id INT DEFAULT NULL,
        mod_date DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        modifieur_id INT DEFAULT NULL,
        CONSTRAINT fk_users_createur_id FOREIGN KEY (createur_id) REFERENCES users (user_id) ON DELETE SET NULL,
        CONSTRAINT fk_users_modifieur_id FOREIGN KEY (modifieur_id) REFERENCES users (user_id) ON DELETE SET NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Password parameters table
CREATE TABLE
    IF NOT EXISTS pass_params (
        pass_param_id INT AUTO_INCREMENT PRIMARY KEY,
        pass_expir_day INT NOT NULL DEFAULT 90,
        allow_past_pass BOOLEAN NOT NULL DEFAULT FALSE,
        mod_date DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        modifieur_id INT DEFAULT NULL,
        CONSTRAINT fk_pass_params_modifieur_id FOREIGN KEY (modifieur_id) REFERENCES users (user_id) ON DELETE SET NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- User passwords table
CREATE TABLE
    IF NOT EXISTS user_pass (
        user_pass_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        pass VARCHAR(255) NOT NULL,
        is_curr BOOLEAN NOT NULL DEFAULT TRUE,
        is_init BOOLEAN NOT NULL DEFAULT TRUE,
        create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_pass_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Logging sessions table
CREATE TABLE
    IF NOT EXISTS loggings (
        logging_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        is_curr BOOLEAN NOT NULL DEFAULT TRUE,
        debut_logging DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_activ_time DATETIME DEFAULT NULL,
        CONSTRAINT fk_loggings_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Profiles table
CREATE TABLE
    IF NOT EXISTS profils (
        profil_id INT AUTO_INCREMENT PRIMARY KEY,
        profil_lib VARCHAR(100) NOT NULL,
        is_delete BOOLEAN NOT NULL DEFAULT FALSE,
        create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        createur_id INT DEFAULT NULL,
        mod_date DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        modifieur_id INT DEFAULT NULL,
        CONSTRAINT fk_profils_createur_id FOREIGN KEY (createur_id) REFERENCES users (user_id) ON DELETE SET NULL,
        CONSTRAINT fk_profils_modifieur_id FOREIGN KEY (modifieur_id) REFERENCES users (user_id) ON DELETE SET NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Profile permissions table
CREATE TABLE
    IF NOT EXISTS profil_permissions (
        profil_permission_id INT AUTO_INCREMENT PRIMARY KEY,
        profil_id INT NOT NULL,
        permission VARCHAR(100) NOT NULL,
        CONSTRAINT fk_profil_permissions_profil_id FOREIGN KEY (profil_id) REFERENCES profils (profil_id) ON DELETE CASCADE,
        UNIQUE (profil_id, permission)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- User profiles junction table
CREATE TABLE
    IF NOT EXISTS user_profils (
        user_profil_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        profil_id INT NOT NULL,
        CONSTRAINT fk_user_profils_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        CONSTRAINT fk_user_profils_profil_id FOREIGN KEY (profil_id) REFERENCES profils (profil_id) ON DELETE CASCADE,
        UNIQUE (user_id, profil_id)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;