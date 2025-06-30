/*
  # Create Services Table

  1. New Tables
    - `services`
      - `id` (varchar, primary key)
      - `name` (varchar, service name)
      - `description` (text, service description)
      - `duration` (int, duration in minutes)
      - `price` (decimal, service price)
      - `category` (varchar, service category)
      - `is_active` (boolean, service status)
      - `requirements` (json, service requirements)

  2. Security
    - Proper indexing for performance
    - Data validation constraints
*/

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  requirements JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_active (is_active),
  INDEX idx_price (price)
);

-- Insert sample services
INSERT IGNORE INTO services (
  id, name, description, duration, price, category, requirements
) VALUES 
(
  'service-001',
  'Tantric Massage',
  'A holistic approach to wellness and energy healing',
  90,
  300.00,
  'Massage',
  '["Age verification", "Consultation required"]'
),
(
  'service-002',
  'Energy Healing Session',
  'Chakra balancing and energy alignment',
  60,
  200.00,
  'Energy Work',
  NULL
),
(
  'service-003',
  'Meditation & Mindfulness',
  'Guided meditation and mindfulness practice',
  45,
  150.00,
  'Wellness',
  NULL
);