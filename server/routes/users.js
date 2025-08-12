const express = require('express');
const { param, validationResult } = require('express-validator');
const { getDatabase, getRows, getRow, runQuery } = require('../database/init');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  try {
    const db = getDatabase();
    const users = await getRows(db, 'SELECT id, email, name, role, created_at FROM users ORDER BY name');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', verifyToken, [
  param('id').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Users can only access their own data unless they're admin
  if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const db = getDatabase();
    const user = await getRow(db, 'SELECT id, email, name, role, created_at FROM users WHERE id = ?', req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
