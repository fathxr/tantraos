/*
  # Create Appointments Table

  1. New Tables
    - `appointments`
      - `id` (varchar, primary key)
      - `client_id` (varchar, foreign key to users)
      - `staff_id` (varchar, foreign key to users)
      - `service_id` (varchar, foreign key to services)
      - `appointment_date` (datetime, appointment date and time)
      - `duration` (int, duration in minutes)
      - `status` (enum, appointment status)
      - `notes` (text, appointment notes)
      - `price` (decimal, appointment price)

  2. Security
    - Foreign key constraints
    - Proper indexing for performance
*/

CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) NOT NULL,
  staff_id VARCHAR(36) NOT NULL,
  service_id VARCHAR(36) NOT NULL,
  appointment_date DATETIME NOT NULL,
  duration INT NOT NULL,
  status ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  
  INDEX idx_client (client_id),
  INDEX idx_staff (staff_id),
  INDEX idx_date (appointment_date),
  INDEX idx_status (status)
);