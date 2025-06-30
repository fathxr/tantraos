import express from 'express';
import { getPool } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const pool = getPool();
    
    // Revenue analytics
    const [revenueStats] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN DATE(appointment_date) = CURDATE() AND status = 'completed' THEN price ELSE 0 END) as daily,
        SUM(CASE WHEN WEEK(appointment_date) = WEEK(NOW()) AND status = 'completed' THEN price ELSE 0 END) as weekly,
        SUM(CASE WHEN MONTH(appointment_date) = MONTH(NOW()) AND status = 'completed' THEN price ELSE 0 END) as monthly,
        SUM(CASE WHEN YEAR(appointment_date) = YEAR(NOW()) AND status = 'completed' THEN price ELSE 0 END) as yearly
      FROM appointments
    `);

    // Client analytics
    const [clientStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN u.is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new,
        SUM(CASE WHEN c.total_sessions > 0 THEN 1 ELSE 0 END) as returning
      FROM users u
      JOIN clients c ON u.id = c.user_id
      WHERE u.role = 'client'
    `);

    // Appointment analytics
    const [appointmentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status IN ('scheduled', 'confirmed') THEN 1 ELSE 0 END) as pending
      FROM appointments
      WHERE MONTH(appointment_date) = MONTH(NOW())
    `);

    // Staff analytics
    const [staffStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN u.is_active = 1 THEN 1 ELSE 0 END) as active,
        ROUND(AVG(CASE WHEN s.total_sessions > 0 THEN (s.total_sessions / 30) * 100 ELSE 0 END), 1) as utilization
      FROM users u
      JOIN staff s ON u.id = s.user_id
      WHERE u.role IN ('staff', 'admin')
    `);

    const analytics = {
      revenue: {
        daily: revenueStats[0].daily || 0,
        weekly: revenueStats[0].weekly || 0,
        monthly: revenueStats[0].monthly || 0,
        yearly: revenueStats[0].yearly || 0
      },
      clients: {
        total: clientStats[0].total || 0,
        active: clientStats[0].active || 0,
        new: clientStats[0].new || 0,
        returning: clientStats[0].returning || 0
      },
      appointments: {
        total: appointmentStats[0].total || 0,
        completed: appointmentStats[0].completed || 0,
        cancelled: appointmentStats[0].cancelled || 0,
        pending: appointmentStats[0].pending || 0
      },
      staff: {
        total: staffStats[0].total || 0,
        active: staffStats[0].active || 0,
        utilization: staffStats[0].utilization || 0
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get revenue trends
router.get('/revenue/trends', requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const pool = getPool();
    
    let query;
    let groupBy;
    
    switch (period) {
      case 'daily':
        query = `
          SELECT 
            DATE(appointment_date) as period,
            SUM(price) as amount
          FROM appointments 
          WHERE status = 'completed' 
          AND appointment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY DATE(appointment_date)
          ORDER BY period
        `;
        break;
      case 'weekly':
        query = `
          SELECT 
            CONCAT(YEAR(appointment_date), '-W', LPAD(WEEK(appointment_date), 2, '0')) as period,
            SUM(price) as amount
          FROM appointments 
          WHERE status = 'completed' 
          AND appointment_date >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
          GROUP BY YEAR(appointment_date), WEEK(appointment_date)
          ORDER BY period
        `;
        break;
      default: // monthly
        query = `
          SELECT 
            DATE_FORMAT(appointment_date, '%Y-%m') as period,
            SUM(price) as amount
          FROM appointments 
          WHERE status = 'completed' 
          AND appointment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY YEAR(appointment_date), MONTH(appointment_date)
          ORDER BY period
        `;
    }
    
    const [trends] = await pool.execute(query);
    res.json(trends);
  } catch (error) {
    console.error('Get revenue trends error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue trends' });
  }
});

// Get client growth trends
router.get('/clients/growth', requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const pool = getPool();
    
    const [growth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as period,
        COUNT(*) as new_clients
      FROM users 
      WHERE role = 'client' 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY period
    `);
    
    res.json(growth);
  } catch (error) {
    console.error('Get client growth error:', error);
    res.status(500).json({ error: 'Failed to fetch client growth data' });
  }
});

// Get service performance
router.get('/services/performance', requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const pool = getPool();
    
    const [performance] = await pool.execute(`
      SELECT 
        s.name,
        s.category,
        COUNT(a.id) as bookings,
        SUM(CASE WHEN a.status = 'completed' THEN a.price ELSE 0 END) as revenue,
        AVG(a.price) as avg_price
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id
      WHERE s.is_active = 1
      GROUP BY s.id, s.name, s.category
      ORDER BY revenue DESC
    `);
    
    res.json(performance);
  } catch (error) {
    console.error('Get service performance error:', error);
    res.status(500).json({ error: 'Failed to fetch service performance data' });
  }
});

export default router;