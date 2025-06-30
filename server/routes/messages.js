import express from 'express';
import { body, validationResult } from 'express-validator';
import { getPool } from '../database/init.js';
import { io } from '../index.js';

const router = express.Router();

// Get conversations for current user
router.get('/conversations', async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;
    
    const [conversations] = await pool.execute(`
      SELECT DISTINCT
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id 
          ELSE m.sender_id 
        END as contact_id,
        u.name as contact_name,
        u.avatar as contact_avatar,
        u.role as contact_role,
        (
          SELECT content 
          FROM messages m2 
          WHERE (m2.sender_id = ? AND m2.receiver_id = contact_id) 
             OR (m2.sender_id = contact_id AND m2.receiver_id = ?)
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM messages m2 
          WHERE (m2.sender_id = ? AND m2.receiver_id = contact_id) 
             OR (m2.sender_id = contact_id AND m2.receiver_id = ?)
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages m2 
          WHERE m2.sender_id = contact_id 
            AND m2.receiver_id = ? 
            AND m2.is_read = FALSE
        ) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE 
        WHEN m.sender_id = ? THEN m.receiver_id 
        ELSE m.sender_id 
      END
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY last_message_time DESC
    `, [userId, userId, userId, userId, userId, userId, userId, userId, userId]);
    
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages between two users
router.get('/conversation/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;
    const pool = getPool();
    
    const [messages] = await pool.execute(`
      SELECT 
        m.id, m.content, m.type, m.platform, m.is_read, m.created_at,
        u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [userId, contactId, contactId, userId]);
    
    // Mark messages as read
    await pool.execute(`
      UPDATE messages 
      SET is_read = TRUE 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
    `, [contactId, userId]);
    
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/send',
  [
    body('receiver_id').isUUID(),
    body('content').isLength({ min: 1, max: 1000 }).trim(),
    body('type').optional().isIn(['text', 'image', 'file']),
    body('platform').optional().isIn(['whatsapp', 'telegram', 'internal'])
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

      const { receiver_id, content, type = 'text', platform = 'internal' } = req.body;
      const sender_id = req.user.id;
      const pool = getPool();

      // Verify receiver exists
      const [receivers] = await pool.execute(
        'SELECT id, name FROM users WHERE id = ?',
        [receiver_id]
      );

      if (receivers.length === 0) {
        return res.status(404).json({ error: 'Receiver not found' });
      }

      // Insert message
      const [result] = await pool.execute(`
        INSERT INTO messages (sender_id, receiver_id, content, type, platform)
        VALUES (?, ?, ?, ?, ?)
      `, [sender_id, receiver_id, content, type, platform]);

      // Get the created message with sender info
      const [newMessage] = await pool.execute(`
        SELECT 
          m.id, m.content, m.type, m.platform, m.is_read, m.created_at,
          u.name as sender_name, u.avatar as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `, [result.insertId]);

      // Emit real-time message
      io.to(`user_${receiver_id}`).emit('new_message', newMessage[0]);

      res.status(201).json({ 
        message: 'Message sent successfully',
        data: newMessage[0]
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// Mark messages as read
router.put('/read/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;
    const pool = getPool();

    await pool.execute(`
      UPDATE messages 
      SET is_read = TRUE 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
    `, [contactId, userId]);

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count
router.get('/unread/count', async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();
    
    const [result] = await pool.execute(`
      SELECT COUNT(*) as unread_count
      FROM messages 
      WHERE receiver_id = ? AND is_read = FALSE
    `, [userId]);
    
    res.json({ unread_count: result[0].unread_count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;