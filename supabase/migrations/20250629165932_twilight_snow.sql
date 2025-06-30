/*
  # Create Users Table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (varchar, user's full name)
      - `email` (varchar, unique email address)
      - `phone` (varchar, phone number)
      - `password_hash` (varchar, hashed password)
      - `role` (enum, user role: admin, staff, client)
      - `avatar` (text, avatar URL)
      - `is_active` (boolean, account status)
      - `language` (enum, preferred language)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp)

  2. Security
    - Enable proper indexing for performance
    - Add unique constraints for email
    - Set up proper foreign key relationships
*/

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'client') NOT NULL DEFAULT 'client',
  avatar TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  language ENUM('en', 'he', 'ru', 'ar') DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active)
);

-- Insert default admin user
INSERT IGNORE INTO users (
  id, name, email, password_hash, role, avatar, language
) VALUES (
  'admin-001',
  'System Administrator',
  'admin@tantraos.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa', -- password: admin123
  'admin',
  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
  'en'
);