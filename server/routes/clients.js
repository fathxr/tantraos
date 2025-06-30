import express from 'express';
import { body, validationResult } from 'express-validator';
import { getPool } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all clients
router.get('/', requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const pool = getPool();
    const [clients] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar, u.language, u.is_active, u.created_at, u.last_login,
        c.is_verified, c.is_whitelisted, c.preferences, c.total_sessions, c.total_spent
      FROM users u
      JOIN clients c ON u.id = c.user_id
      WHERE u.role = 'client'
      ORDER BY u.created_at DESC
    `);

    // Parse JSON preferences
    const formattedClients = clients.map(client => ({
      ...client,
      preferences: typeof client.preferences === 'string' 
        ? JSON.parse(client.preferences) 
        : client.preferences
    }));

    res.json(formattedClients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client
router.get('/:id', requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    const [clients] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar, u.language, u.is_active, u.created_at, u.last_login,
        c.is_verified, c.is_whitelisted, c.preferences, c.total_sessions, c.total_spent
      FROM users u
      JOIN clients c ON u.id = c.user_id
      WHERE u.id = ? AND u.role = 'client'
    `, [id]);

    if (clients.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const client = clients[0];
    client.preferences = typeof client.preferences === 'string' 
      ? JSON.parse(client.preferences) 
      : client.preferences;

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Update client
router.put('/:id', 
  requireRole(['admin', 'staff']),
  [
    body('name').optional().isLength({ min: 2 }).trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone(),
    body('is_verified').optional().isBoolean(),
    body('is_whitelisted').optional().isBoolean(),
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
      const pool = getPool();

      // Separate user updates from client updates
      const userUpdates = {};
      const clientUpdates = {};

      Object.keys(updates).forEach(key => {
        if (['name', 'email', 'phone', 'is_active', 'language'].includes(key)) {
          userUpdates[key] = updates[key];
        } else if (['is_verified', 'is_whitelisted', 'preferences'].includes(key)) {
          clientUpdates[key] = updates[key];
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

      // Update client table
      if (Object.keys(clientUpdates).length > 0) {
        const clientFields = Object.keys(clientUpdates).map(key => {
          if (key === 'preferences') {
            return `${key} = ?`;
          }
          return `${key} = ?`;
        }).join(', ');
        
        const clientValues = Object.values(clientUpdates).map(value => {
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          return value;
        });
        
        await pool.execute(
          `UPDATE clients SET ${clientFields} WHERE user_id = ?`,
          [...clientValues, id]
        );
      }

      res.json({ message: 'Client updated successfully' });
    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({ error: 'Failed to update client' });
    }
  }
);

// Delete client
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ? AND role = "client"',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Get client statistics
router.get('/stats/overview', requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const pool = getPool();
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN u.is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN c.is_verified = 1 THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN c.is_whitelisted = 1 THEN 1 ELSE 0 END) as whitelisted,
        SUM(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_this_month
      FROM users u
      JOIN clients c ON u.id = c.user_id
      WHERE u.role = 'client'
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({ error: 'Failed to fetch client statistics' });
  }
});

export default router;