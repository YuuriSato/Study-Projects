-- MySQL 8+ schema para exigir uso de email corporativo
-- Execute na ordem em um banco novo.

CREATE TABLE IF NOT EXISTS corporate_emails (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_corporate_emails_email (email)
);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  corporate_email_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT fk_users_corporate_email
    FOREIGN KEY (corporate_email_id) REFERENCES corporate_emails (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS computers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_user_id BIGINT UNSIGNED NULL,
  serial_number VARCHAR(120) NOT NULL,
  machine_model VARCHAR(120) NULL,
  warranty_days INT UNSIGNED NOT NULL,
  specs TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_computers_serial_number (serial_number),
  CONSTRAINT fk_computers_owner_user
    FOREIGN KEY (owner_user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

-- Exemplo de seed: emails autorizados pela empresa
-- INSERT INTO corporate_emails (email, active) VALUES
-- ('joao@empresa.com', 1),
-- ('maria@empresa.com', 1);

