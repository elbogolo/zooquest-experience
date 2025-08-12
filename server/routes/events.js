const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getDatabase, generateId, getRows, getRow, runQuery } = require('../database/init');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const events = await getRows(db, 'SELECT * FROM events ORDER BY date, time');
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID
router.get('/:id', [
  param('id').notEmpty().withMessage('Event ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    const event = await getRow(db, 'SELECT * FROM events WHERE id = ?', [req.params.id]);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    const eventId = generateId();
    const now = new Date().toISOString();
    
    const stmt = 'INSERT INTO events (id, title, description, date, time, location, capacity, registered_count, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await runQuery(db, stmt, [
      eventId,
      req.body.title,
      req.body.description || null,
      req.body.date,
      req.body.time,
      req.body.location,
      req.body.capacity || 0,
      0, // registered_count starts at 0
      req.body.status || 'Scheduled',
      now,
      now
    ]);
    
    const newEvent = await getRow(db, 'SELECT * FROM events WHERE id = ?', [eventId]);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', [
  param('id').notEmpty().withMessage('Event ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    
    // Check if event exists
    const existingEvent = await getRow(db, 'SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const now = new Date().toISOString();
    const updateFields = [];
    const updateValues = [];
    
    // Build dynamic update query
    const allowedFields = [
      'title', 'description', 'date', 'time', 'location', 'capacity', 
      'registered_count', 'status'
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
    
    const updateQuery = `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`;
    await runQuery(db, updateQuery, updateValues);
    
    const updatedEvent = await getRow(db, 'SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', [
  param('id').notEmpty().withMessage('Event ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    
    // Check if event exists
    const existingEvent = await getRow(db, 'SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Delete the event
    await runQuery(db, 'DELETE FROM events WHERE id = ?', [req.params.id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
