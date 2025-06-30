import express from 'express';
import { body, validationResult } from 'express-validator';
import { getPool } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    const pool = getPool();
    
    let query = 'SELECT * FROM services WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (active !== undefined) {
      query += ' AND is_active = ?';
      params.push(active === 'true');
    }
    
    query += ' ORDER BY category, name';
    
    const [services] = await pool.execute(query, params);
    
    // Parse requirements JSON
    const formattedServices = services.map(service => ({
      ...service,
      requirements: service.requirements ? JSON.parse(service.requirements) : null
    }));
    
    res.json(formattedServices);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    const [services] = await pool.execute(
      'SELECT * FROM services WHERE id = ?',
      [id]
    );
    
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    const service = services[0];
    service.requirements = service.requirements ? JSON.parse(service.requirements) : null;
    
    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create service
router.post('/',
  requireRole(['admin']),
  [
    body('name').isLength({ min: 2 }).trim(),
    body('description').optional().isLength({ max: 1000 }).trim(),
    body('duration').isInt({ min: 15, max: 480 }),
    body('price').isDecimal({ decimal_digits: '0,2' }),
    body('category').isLength({ min: 2 }).trim(),
    body('requirements').optional().isArray()
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

      const { name, description, duration, price, category, requirements, is_active = true } = req.body;
      const pool = getPool();

      const [result] = await pool.execute(`
        INSERT INTO services (name, description, duration, price, category, requirements, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        name, 
        description, 
        duration, 
        price, 
        category, 
        requirements ? JSON.stringify(requirements) : null,
        is_active
      ]);

      res.status(201).json({ 
        message: 'Service created successfully',
        id: result.insertId
      });
    } catch (error) {
      console.error('Create service error:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  }
);

// Update service
router.put('/:id',
  requireRole(['admin']),
  [
    body('name').optional().isLength({ min: 2 }).trim(),
    body('description').optional().isLength({ max: 1000 }).trim(),
    body('duration').optional().isInt({ min: 15, max: 480 }),
    body('price').optional().isDecimal({ decimal_digits: '0,2' }),
    body('category').optional().isLength({ min: 2 }).trim(),
    body('requirements').optional().isArray(),
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

      // Check if service exists
      const [services] = await pool.execute(
        'SELECT id FROM services WHERE id = ?',
        [id]
      );

      if (services.length === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }

      // Prepare update query
      const fields = Object.keys(updates).map(key => {
        if (key === 'requirements') {
          return `${key} = ?`;
        }
        return `${key} = ?`;
      }).join(', ');

      const values = Object.values(updates).map(value => {
        if (Array.isArray(value)) {
          return JSON.stringify(value);
        }
        return value;
      });

      await pool.execute(
        `UPDATE services SET ${fields} WHERE id = ?`,
        [...values, id]
      );

      res.json({ message: 'Service updated successfully' });
    } catch (error) {
      console.error('Update service error:', error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  }
);

// Delete service
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Check if service has appointments
    const [appointments] = await pool.execute(
      'SELECT id FROM appointments WHERE service_id = ? LIMIT 1',
      [id]
    );

    if (appointments.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete service with existing appointments' 
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM services WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Get service categories
router.get('/categories/list', async (req, res) => {
  try {
    const pool = getPool();
    
    const [categories] = await pool.execute(`
      SELECT DISTINCT category, COUNT(*) as service_count
      FROM services 
      WHERE is_active = 1
      GROUP BY category
      ORDER BY category
    `);
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;