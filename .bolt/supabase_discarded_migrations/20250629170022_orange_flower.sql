/*
  # Create Settings Table

  1. New Tables
    - `settings`
      - `key` (varchar, setting key)
      - `value` (json, setting value)
      - `category` (varchar, setting category)
      - `description` (text, setting description)

  2. Security
    - Proper indexing for performance
    - Data validation constraints
*/

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(255) PRIMARY KEY,
  `value` JSON NOT NULL,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category)
);

-- Insert default settings
INSERT IGNORE INTO settings (`key`, `value`, category, description) VALUES 
('business_info', '{"name": "TantraOS Wellness Center", "email": "admin@tantraos.com", "phone": "+972-50-123-4567", "address": "Tel Aviv, Israel"}', 'general', 'Business information settings'),
('notifications', '{"email": true, "sms": true, "whatsapp": true, "reminders": true}', 'notifications', 'Notification preferences'),
('security', '{"two_factor": true, "session_timeout": 30, "password_expiry": 90}', 'security', 'Security configuration'),
('integrations', '{"whatsapp": {"enabled": false}, "telegram": {"enabled": false}, "email": {"enabled": true}}', 'integrations', 'Third-party integrations');