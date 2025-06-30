import express from 'express';
import { body, validationResult } from 'express-validator';
import { getPool } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all settings
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const { category } = req.query;
    const pool = getPool();
    
    let query = 'SELECT * FROM settings';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY category, `key`';
    
    const [settings] = await pool.execute(query, params);
    
    // Format settings as key-value pairs
    const formattedSettings = {};
    settings.forEach(setting => {
      if (!formattedSettings[setting.category]) {
        formattedSettings[setting.category] = {};
      }
      formattedSettings[setting.category][setting.key] = setting.value;
    });
    
    res.json(formattedSettings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get specific setting
router.get('/:key', requireRole(['admin']), async (req, res) => {
  try {
    const { key } = req.params;
    const pool = getPool();
    
    const [settings] = await pool.execute(
      'SELECT * FROM settings WHERE `key` = ?',
      [key]
    );
    
    if (settings.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json(settings[0]);
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Update setting
router.put('/:key',
  requireRole(['admin']),
  [
    body('value').exists(),
    body('category').optional().isLength({ min: 1 }).trim(),
    body('description').optional().isLength({ max: 500 }).trim()
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

      const { key } = req.params;
      const { value, category, description } = req.body;
      const pool = getPool();

      // Check if setting exists
      const [existing] = await pool.execute(
        'SELECT `key` FROM settings WHERE `key` = ?',
        [key]
      );

      const jsonValue = JSON.stringify(value);

      if (existing.length === 0) {
        // Create new setting
        await pool.execute(
          'INSERT INTO settings (`key`, `value`, category, description) VALUES (?, ?, ?, ?)',
          [key, jsonValue, category, description]
        );
      } else {
        // Update existing setting
        const updates = { value: jsonValue };
        if (category !== undefined) updates.category = category;
        if (description !== undefined) updates.description = description;

        const fields = Object.keys(updates).map(k => `${k === 'key' ? '`key`' : k} = ?`).join(', ');
        const values = Object.values(updates);

        await pool.execute(
          `UPDATE settings SET ${fields} WHERE \`key\` = ?`,
          [...values, key]
        );
      }

      res.json({ message: 'Setting updated successfully' });
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({ error: 'Failed to update setting' });
    }
  }
);

// Bulk update settings
router.put('/',
  requireRole(['admin']),
  [
    body('settings').isObject()
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

      const { settings } = req.body;
      const pool = getPool();

      // Start transaction
      await pool.execute('START TRANSACTION');

      try {
        for (const [category, categorySettings] of Object.entries(settings)) {
          for (const [key, value] of Object.entries(categorySettings)) {
            const settingKey = `${category}_${key}`;
            const jsonValue = JSON.stringify(value);

            await pool.execute(`
              INSERT INTO settings (\`key\`, \`value\`, category) 
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE 
              \`value\` = VALUES(\`value\`),
              category = VALUES(category)
            `, [settingKey, jsonValue, category]);
          }
        }

        await pool.execute('COMMIT');
        res.json({ message: 'Settings updated successfully' });
      } catch (error) {
        await pool.execute('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Bulk update settings error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
);

// Delete setting
router.delete('/:key', requireRole(['admin']), async (req, res) => {
  try {
    const { key } = req.params;
    const pool = getPool();

    const [result] = await pool.execute(
      'DELETE FROM settings WHERE `key` = ?',
      [key]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

// Get system status
router.get('/system/status', requireRole(['admin']), async (req, res) => {
  try {
    const pool = getPool();
    
    // Get database status
    const [dbStatus] = await pool.execute('SELECT 1 as connected');
    
    // Get basic system metrics
    const status = {
      database: dbStatus.length > 0 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      timestamp: new Date().toISOString()
    };
    
    res.json(status);
  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});

export default router;