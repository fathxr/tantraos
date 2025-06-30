/*
  # Create Staff Table

  1. New Tables
    - `staff`
      - `user_id` (varchar, foreign key to users)
      - `specializations` (json, array of specializations)
      - `schedule` (json, weekly schedule)
      - `rating` (decimal, average rating)
      - `total_sessions` (int, total sessions conducted)

  2. Security
    - Foreign key constraint to users table
    - Proper indexing for performance
*/

CREATE TABLE IF NOT EXISTS staff (
  user_id VARCHAR(36) PRIMARY KEY,
  specializations JSON,
  schedule JSON,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_sessions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_rating (rating)
);

-- Insert sample staff
INSERT IGNORE INTO users (
  id, name, email, phone, password_hash, role, avatar, language
) VALUES (
  'staff-001',
  'Maya Wellness',
  'maya@tantraos.com',
  '+972-50-555-6666',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa',
  'staff',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
  'en'
);

INSERT IGNORE INTO staff (
  user_id, specializations, schedule, rating, total_sessions
) VALUES (
  'staff-001',
  '["Tantric Massage", "Energy Healing", "Meditation"]',
  '{"monday": {"start": "09:00", "end": "17:00", "available": true}, "tuesday": {"start": "09:00", "end": "17:00", "available": true}, "wednesday": {"start": "09:00", "end": "17:00", "available": true}, "thursday": {"start": "09:00", "end": "17:00", "available": true}, "friday": {"start": "09:00", "end": "15:00", "available": true}, "saturday": {"start": "10:00", "end": "16:00", "available": true}, "sunday": {"start": "10:00", "end": "16:00", "available": false}}',
  4.9,
  156
);