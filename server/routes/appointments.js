import express from 'express';
import { body, validationResult } from 'express-validator';
import { getPool } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const { date, status, client_id, staff_id } = req.query;
    const pool = getPool();
    
    let query = `
      SELECT 
        a.id, a.appointment_date, a.duration, a.status, a.notes, a.price, a.created_at,
        c.name as client_name, c.email as client_email, c.avatar as client_avatar,
        s.name as staff_name, s.email as staff_email,
        srv.name as service_name, srv.category as service_category
      FROM appointments a
      JOIN users c ON a.client_id = c.id
      JOIN users s ON a.staff_id = s.id
      JOIN services srv ON a.service_id = srv.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (date) {
      query += ' AND DATE(a.appointment_date) = ?';
      params.push(date);
    }
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    if (client_id) {
      query += ' AND a.client_id = ?';
      params.push(client_id);
    }
    
    if (staff_id) {
      query += ' AND a.staff_id = ?';
      params.push(staff_id);
    }
    
    // If user is a client, only show their appointments
    if (req.user.role === 'client') {
      query += ' AND a.client_id = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY a.appointment_date DESC';
    
    const [appointments] = await pool.execute(query, params);
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Create appointment
router.post('/',
  [
    body('client_id').isUUID(),
    body('staff_id').isUUID(),
    body('service_id').isUUID(),
    body('appointment_date').isISO8601(),
    body('duration').isInt({ min: 15, max: 480 }),
    body('price').isDecimal({ decimal_digits: '0,2' })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { client_id, staff_id, service_id, appointment_date, duration, notes, price } = req.body;
      const pool = getPool();

      // Check for conflicts
      const [conflicts] = await pool.execute(`
        SELECT id FROM appointments 
        WHERE staff_id = ? 
        AND appointment_date = ? 
        AND status NOT IN ('cancelled', 'completed')
      `, [staff_id, appointment_date]);

      if (conflicts.length > 0) {
        return res.status(409).json({ error: 'Time slot already booked' });
      }

      // Create appointment
      const [result] = await pool.execute(`
        INSERT INTO appointments (client_id, staff_id, service_id, appointment_date, duration, notes, price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [client_id, staff_id, service_id, appointment_date, duration, notes, price]);

      res.status(201).json({ 
        message: 'Appointment created successfully',
        id: result.insertId
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  }
);

// Update appointment
router.put('/:id',
  [
    body('appointment_date').optional().isISO8601(),
    body('duration').optional().isInt({ min: 15, max: 480 }),
    body('status').optional().isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled']),
    body('price').optional().isDecimal({ decimal_digits: '0,2' })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { id } = req.params;
      const updates = req.body;
      const pool = getPool();

      // Check if appointment exists and user has permission
      const [appointments] = await pool.execute(
        'SELECT client_id, staff_id FROM appointments WHERE id = ?',
        [id]
      );

      if (appointments.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      const appointment = appointments[0];

      // Check permissions
      if (req.user.role === 'client' && appointment.client_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (req.user.role === 'staff' && appointment.staff_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update appointment
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);

      await pool.execute(
        `UPDATE appointments SET ${fields} WHERE id = ?`,
        [...values, id]
      );

      res.json({ message: 'Appointment updated successfully' });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  }
);

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Check if appointment exists and user has permission
    const [appointments] = await pool.execute(
      'SELECT client_id, staff_id FROM appointments WHERE id = ?',
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Check permissions
    if (req.user.role === 'client' && appointment.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'staff' && appointment.staff_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.execute('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Get appointment statistics
router.get('/stats/overview', requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const pool = getPool();
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status IN ('scheduled', 'confirmed') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN DATE(appointment_date) = CURDATE() THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as total_revenue
      FROM appointments
      WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment statistics' });
  }
});

export default router;