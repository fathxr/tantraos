/*
  # Create Messages Table

  1. New Tables
    - `messages`
      - `id` (varchar, primary key)
      - `sender_id` (varchar, foreign key to users)
      - `receiver_id` (varchar, foreign key to users)
      - `content` (text, message content)
      - `type` (enum, message type)
      - `platform` (enum, message platform)
      - `is_read` (boolean, read status)

  2. Security
    - Foreign key constraints
    - Proper indexing for performance
*/

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  sender_id VARCHAR(36) NOT NULL,
  receiver_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('text', 'image', 'file') DEFAULT 'text',
  platform ENUM('whatsapp', 'telegram', 'internal') DEFAULT 'internal',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_sender (sender_id),
  INDEX idx_receiver (receiver_id),
  INDEX idx_read (is_read),
  INDEX idx_platform (platform)
);