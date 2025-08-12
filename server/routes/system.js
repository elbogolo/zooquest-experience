const express = require('express');
const { getDatabase, getRow } = require('../database/init');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get system statistics
router.get('/stats', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Access denied. Admin or staff role required.' });
  }

  try {
    const db = getDatabase();
    
    const totalAnimals = (await getRow(db, 'SELECT COUNT(*) as count FROM animals')).count;
    const totalEvents = (await getRow(db, 'SELECT COUNT(*) as count FROM events')).count;
    const totalNotifications = (await getRow(db, 'SELECT COUNT(*) as count FROM notifications')).count;
    const totalHealthReports = (await getRow(db, 'SELECT COUNT(*) as count FROM health_reports')).count;
    const totalUsers = (await getRow(db, 'SELECT COUNT(*) as count FROM users')).count;
    
    const healthyAnimals = (await getRow(db, 'SELECT COUNT(*) as count FROM animals WHERE status = ?', ['healthy'])).count;
    const upcomingEvents = (await getRow(db, 'SELECT COUNT(*) as count FROM events WHERE date >= ? AND status = ?',
      [new Date().toISOString().split('T')[0], 'scheduled'])).count;
    const sentNotifications = (await getRow(db, 'SELECT COUNT(*) as count FROM notifications WHERE status = ?', ['sent'])).count;

    const stats = {
      totalAnimals,
      totalEvents,
      totalNotifications,
      totalHealthReports,
      totalUsers,
      healthyAnimals,
      upcomingEvents,
      sentNotifications
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching system statistics:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

// Get system settings
router.get('/settings', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  try {
    // Return default settings for now - can be enhanced to store in database
    const settings = {
      enableNotifications: true,
      theme: 'light',
      lastBackupDate: new Date().toISOString()
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

module.exports = router;
