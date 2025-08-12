const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getDatabase, generateId, getRows, getRow, runQuery } = require('../database/init');

const router = express.Router();

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const notifications = await getRows(db, 'SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get notification by ID
router.get('/:id', [
  param('id').notEmpty().withMessage('Notification ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    const notification = await getRow(db, 'SELECT * FROM notifications WHERE id = ?', [req.params.id]);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

// Create new notification
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('recipients').notEmpty().withMessage('Recipients is required'),
  body('status').isIn(['scheduled', 'draft', 'sent'])
    .withMessage('Status must be valid'),
  body('priority').isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be valid')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    const notificationId = generateId();
    const now = new Date().toISOString();
    
    const stmt = 'INSERT INTO notifications (id, title, message, recipients, status, priority, sent_at, scheduled_for, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await runQuery(db, stmt, [
      notificationId,
      req.body.title,
      req.body.message,
      req.body.recipients,
      req.body.status,
      req.body.priority,
      req.body.sent_at || null,
      req.body.scheduled_for || null,
      req.body.created_by || null,
      now,
      now
    ]);
    
    const newNotification = await getRow(db, 'SELECT * FROM notifications WHERE id = ?', [notificationId]);
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Update notification
router.put('/:id', [
  param('id').notEmpty().withMessage('Notification ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    
    // Check if notification exists
    const existingNotification = await getRow(db, 'SELECT * FROM notifications WHERE id = ?', [req.params.id]);
    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const now = new Date().toISOString();
    const updateFields = [];
    const updateValues = [];
    
    // Build dynamic update query
    const allowedFields = [
      'title', 'message', 'recipients', 'status', 'priority', 'sent_at', 
      'scheduled_for', 'created_by'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(req.body[field]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(req.params.id);
    
    const updateQuery = `UPDATE notifications SET ${updateFields.join(', ')} WHERE id = ?`;
    await runQuery(db, updateQuery, updateValues);
    
    const updatedNotification = await getRow(db, 'SELECT * FROM notifications WHERE id = ?', [req.params.id]);
    res.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Delete notification
router.delete('/:id', [
  param('id').notEmpty().withMessage('Notification ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    
    // Check if notification exists
    const existingNotification = await getRow(db, 'SELECT * FROM notifications WHERE id = ?', [req.params.id]);
    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Delete the notification
    await runQuery(db, 'DELETE FROM notifications WHERE id = ?', [req.params.id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
