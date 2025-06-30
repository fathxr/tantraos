import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { getPool } from '../database/init.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint
router.post('/login', 
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
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

      const { email, password } = req.body;
      const pool = getPool();

      // Find user by email
      const [users] = await pool.execute(
        'SELECT id, name, email, password_hash, role, is_active, avatar, language FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];

      if (!user.is_active) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await pool.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Generate JWT token
      const token = generateToken(user.id);

      // Remove password hash from response
      delete user.password_hash;

      res.json({
        message: 'Login successful',
        token,
        user
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Register endpoint
router.post('/register',
  [
    body('name').isLength({ min: 2 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('phone').optional().isMobilePhone(),
    body('role').optional().isIn(['client', 'staff'])
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

      const { name, email, password, phone, role = 'client', language = 'en' } = req.body;
      const pool = getPool();

      // Check if user already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password_hash, phone, role, language) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, passwordHash, phone, role, language]
      );

      const userId = result.insertId;

      // If client, create client record
      if (role === 'client') {
        await pool.execute(
          'INSERT INTO clients (user_id, preferences) VALUES (?, ?)',
          [userId, JSON.stringify({ notifications: true, language })]
        );
      }

      // Generate token
      const token = generateToken(userId);

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: userId,
          name,
          email,
          role,
          language
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a real implementation, you might want to blacklist the token
  res.json({ message: 'Logout successful' });
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newToken = generateToken(decoded.userId);

    res.json({ token: newToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

export default router;