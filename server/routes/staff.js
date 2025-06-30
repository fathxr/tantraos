import express from 'express';
import { body, validationResult } from 'express-validator';
import { getPool } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all staff
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const pool = getPool();
    const [staff] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar, u.language, u.is_active, u.created_at, u.last_login,
        s.specializations, s.schedule, s.rating, s.total_sessions
      FROM users u
      JOIN staff s ON u.id = s.user_id
      WHERE u.role IN ('staff', 'admin')
      ORDER BY u.created_at DESC
    `);

    // Parse JSON fields
    const formattedStaff = staff.map(member => ({
      ...member,
      specializations: typeof member.specializations === 'string' 
        ? JSON.parse(member.specializations) 
        : member.specializations,
      schedule: typeof member.schedule === 'string' 
        ? JSON.parse(member.schedule) 
        : member.schedule
    }));

    res.json(formattedStaff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Get single staff member
router.get('/:id', requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    // Check permissions - staff can only view their own profile
    if (req.user.role === 'staff' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const [staff] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar, u.language, u.is_active, u.created_at, u.last_login,
        s.specializations, s.schedule, s.rating, s.total_sessions
      FROM users u
      JOIN staff s ON u.id = s.user_id
      WHERE u.id = ? AND u.role IN ('staff', 'admin')
    `, [id]);

    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const member = staff[0];
    member.specializations = typeof member.specializations === 'string' 
      ? JSON.parse(member.specializations) 
      : member.specializations;
    member.schedule = typeof member.schedule === 'string' 
      ? JSON.parse(member.schedule) 
      : member.schedule;

    res.json(member);
  } catch (error) {
    console.error('Get staff member error:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

// Update staff member
router.put('/:id', 
  requireRole(['admin', 'staff']),
  [
    body('name').optional().isLength({ min: 2 }).trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone(),
    body('specializations').optional().isArray(),
    body('schedule').optional().isObject(),
    body('is_active').optional().isBoolean()
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
      
      // Check permissions - staff can only update their own profile
      if (req.user.role === 'staff' && req.user.id !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const pool = getPool();

      // Separate user updates from staff updates
      const userUpdates = {};
      const staffUpdates = {};

      Object.keys(updates).forEach(key => {
        if (['name', 'email', 'phone', 'is_active', 'language'].includes(key)) {
          userUpdates[key] = updates[key];
        } else if (['specializations', 'schedule'].includes(key)) {
          staffUpdates[key] = updates[key];
        }
      });

      // Update user table
      if (Object.keys(userUpdates).length > 0) {
        const userFields = Object.keys(userUpdates).map(key => `${key} = ?`).join(', ');
        const userValues = Object.values(userUpdates);
        
        await pool.execute(
          `UPDATE users SET ${userFields} WHERE id = ?`,
          [...userValues, id]
        );
      }

      // Update staff table
      if (Object.keys(staffUpdates).length > 0) {
        const staffFields = Object.keys(staffUpdates).map(key => `${key} = ?`).join(', ');
        const staffValues = Object.values(staffUpdates).map(value => {
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          return value;
        });
        
        await pool.execute(
          `UPDATE staff SET ${staffFields} WHERE user_id = ?`,
          [...staffValues, id]
        );
      }

      res.json({ message: 'Staff member updated successfully' });
    } catch (error) {
      console.error('Update staff member error:', error);
      res.status(500).json({ error: 'Failed to update staff member' });
    }
  }
);

// Get staff availability
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const pool = getPool();

    // Get staff schedule
    const [staff] = await pool.execute(
      'SELECT schedule FROM staff WHERE user_id = ?',
      [id]
    );

    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const schedule = JSON.parse(staff[0].schedule);
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const daySchedule = schedule[dayOfWeek];

    if (!daySchedule || !daySchedule.available) {
      return res.json({ available: false, slots: [] });
    }

    // Get existing appointments for the date
    const [appointments] = await pool.execute(`
      SELECT appointment_date, duration 
      FROM appointments 
      WHERE staff_id = ? AND DATE(appointment_date) = ? 
      AND status NOT IN ('cancelled', 'completed')
    `, [id, date]);

    // Generate available time slots (simplified logic)
    const slots = [];
    const startTime = daySchedule.start;
    const endTime = daySchedule.end;
    
    // This is a simplified implementation
    // In production, you'd want more sophisticated slot generation
    const bookedTimes = appointments.map(apt => apt.appointment_date);
    
    res.json({
      available: true,
      schedule: daySchedule,
      booked_times: bookedTimes,
      slots: slots
    });
  } catch (error) {
    console.error('Get staff availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Get staff statistics
router.get('/stats/overview', requireRole(['admin']), async (req, res) => {
  try {
    const pool = getPool();
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN u.is_active = 1 THEN 1 ELSE 0 END) as active,
        AVG(s.rating) as avg_rating,
        SUM(s.total_sessions) as total_sessions
      FROM users u
      JOIN staff s ON u.id = s.user_id
      WHERE u.role IN ('staff', 'admin')
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Get staff stats error:', error);
    res.status(500).json({ error: 'Failed to fetch staff statistics' });
  }
});

export default router;