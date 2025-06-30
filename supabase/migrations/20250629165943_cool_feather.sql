/*
  # Create Clients Table

  1. New Tables
    - `clients`
      - `user_id` (varchar, foreign key to users)
      - `is_verified` (boolean, verification status)
      - `is_whitelisted` (boolean, whitelist status)
      - `preferences` (json, client preferences)
      - `total_sessions` (int, total completed sessions)
      - `total_spent` (decimal, total amount spent)

  2. Security
    - Foreign key constraint to users table
    - Proper indexing for performance
*/

CREATE TABLE IF NOT EXISTS clients (
  user_id VARCHAR(36) PRIMARY KEY,
  is_verified BOOLEAN DEFAULT FALSE,
  is_whitelisted BOOLEAN DEFAULT FALSE,
  preferences JSON,
  total_sessions INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_verified (is_verified),
  INDEX idx_whitelisted (is_whitelisted)
);

-- Insert sample clients
INSERT IGNORE INTO users (
  id, name, email, phone, password_hash, role, avatar, language
) VALUES 
(
  'client-001',
  'Sarah Cohen',
  'sarah@example.com',
  '+972-50-111-2222',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa',
  'client',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
  'he'
),
(
  'client-002',
  'Elena Petrov',
  'elena@example.com',
  '+972-50-333-4444',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa',
  'client',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
  'ru'
);

INSERT IGNORE INTO clients (
  user_id, is_verified, is_whitelisted, preferences, total_sessions, total_spent
) VALUES 
(
  'client-001',
  TRUE,
  TRUE,
  '{"services": ["massage", "meditation"], "notifications": true, "language": "he"}',
  12,
  2400.00
),
(
  'client-002',
  TRUE,
  TRUE,
  '{"services": ["yoga", "aromatherapy"], "notifications": true, "language": "ru"}',
  8,
  1600.00
);