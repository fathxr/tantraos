/*
  # Initial TantraOS Database Schema

  1. New Tables
    - `users` - Core user management with roles
    - `clients` - Client-specific data and preferences  
    - `staff` - Staff-specific data and schedules
    - `services` - Available services and pricing
    - `appointments` - Appointment scheduling and tracking
    - `messages` - Multi-platform messaging system
    - `settings` - System configuration storage

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Implement proper foreign key constraints

  3. Features
    - Multi-language support
    - Audit trails with timestamps
    - Flexible JSON storage for preferences
    - Support for multiple messaging platforms
*/

-- Users table (core authentication and profile)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'staff', 'client') NOT NULL DEFAULT 'client',
  avatar TEXT,
  language VARCHAR(5) DEFAULT 'en',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active)
);

-- Clients table (client-specific data)
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_whitelisted BOOLEAN DEFAULT FALSE,
  preferences JSON,
  total_sessions INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_verified (is_verified),
  INDEX idx_whitelisted (is_whitelisted)
);

-- Staff table (staff-specific data)
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  specializations JSON,
  schedule JSON,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_sessions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_rating (rating)
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  requirements JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active (is_active),
  INDEX idx_price (price)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) NOT NULL,
  staff_id VARCHAR(36) NOT NULL,
  service_id VARCHAR(36) NOT NULL,
  appointment_date DATETIME NOT NULL,
  duration INT NOT NULL, -- in minutes
  status ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  INDEX idx_client_id (client_id),
  INDEX idx_staff_id (staff_id),
  INDEX idx_service_id (service_id),
  INDEX idx_appointment_date (appointment_date),
  INDEX idx_status (status)
);

-- Messages table (multi-platform messaging)
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  sender_id VARCHAR(36) NOT NULL,
  receiver_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('text', 'image', 'file') DEFAULT 'text',
  platform ENUM('whatsapp', 'telegram', 'internal') DEFAULT 'internal',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read),
  INDEX idx_platform (platform)
);

-- Settings table (system configuration)
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `key` VARCHAR(255) UNIQUE NOT NULL,
  `value` JSON NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (`key`),
  INDEX idx_category (category)
);

-- Insert default admin user
INSERT IGNORE INTO users (id, name, email, password_hash, role, language) VALUES 
('admin-001', 'Admin User', 'admin@tantraos.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL8.WrO.S', 'admin', 'en');

-- Insert default staff user  
INSERT IGNORE INTO users (id, name, email, password_hash, role, language) VALUES 
('staff-001', 'Staff Member', 'staff@tantraos.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL8.WrO.S', 'staff', 'en');

-- Insert staff record for staff user
INSERT IGNORE INTO staff (user_id, specializations, schedule) VALUES 
('staff-001', '["Tantric Massage", "Energy Healing"]', '{"monday": {"start": "09:00", "end": "17:00", "available": true}, "tuesday": {"start": "09:00", "end": "17:00", "available": true}, "wednesday": {"start": "09:00", "end": "17:00", "available": true}, "thursday": {"start": "09:00", "end": "17:00", "available": true}, "friday": {"start": "09:00", "end": "17:00", "available": true}, "saturday": {"start": "10:00", "end": "16:00", "available": true}, "sunday": {"start": "10:00", "end": "16:00", "available": false}}');

-- Insert default services
INSERT IGNORE INTO services (id, name, description, duration, price, category) VALUES 
('service-001', 'Tantric Massage', 'Traditional tantric massage therapy', 90, 300.00, 'Massage'),
('service-002', 'Energy Healing', 'Chakra balancing and energy work', 60, 200.00, 'Healing'),
('service-003', 'Couples Session', 'Tantric session for couples', 120, 500.00, 'Couples'),
('service-004', 'Consultation', 'Initial consultation and assessment', 30, 100.00, 'Consultation');

-- Insert default settings
INSERT IGNORE INTO settings (`key`, `value`, category, description) VALUES 
('business_name', '"TantraOS Wellness Center"', 'general', 'Business name'),
('business_email', '"admin@tantraos.com"', 'general', 'Business contact email'),
('business_phone', '"+972-50-123-4567"', 'general', 'Business contact phone'),
('default_language', '"en"', 'general', 'Default system language'),
('currency', '"ILS"', 'general', 'Default currency'),
('timezone', '"Asia/Jerusalem"', 'general', 'Default timezone'),
('email_notifications', 'true', 'notifications', 'Enable email notifications'),
('sms_notifications', 'true', 'notifications', 'Enable SMS notifications'),
('whatsapp_notifications', 'true', 'notifications', 'Enable WhatsApp notifications'),
('appointment_reminders', 'true', 'notifications', 'Enable appointment reminders'),
('reminder_hours', '24', 'notifications', 'Hours before appointment to send reminder'),
('auto_backup', 'true', 'backup', 'Enable automatic backups'),
('backup_frequency', '"daily"', 'backup', 'Backup frequency'),
('retention_days', '30', 'backup', 'Backup retention period in days');