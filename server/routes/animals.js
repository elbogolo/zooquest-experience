const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getDatabase, generateId, getRows, getRow, runQuery } = require('../database/init');

const router = express.Router();

// Get all animals
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const animals = await getRows(db, 'SELECT * FROM animals ORDER BY name');
    res.json(animals);
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

// Get animal by ID
router.get('/:id', [
  param('id').notEmpty().withMessage('Animal ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    const animal = await getRow(db, 'SELECT * FROM animals WHERE id = ?', [req.params.id]);
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    res.json(animal);
  } catch (error) {
    console.error('Error fetching animal:', error);
    res.status(500).json({ error: 'Failed to fetch animal' });
  }
});

// Create new animal
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('species').notEmpty().withMessage('Species is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('status').isIn(['healthy', 'sick', 'quarantine', 'treatment'])
    .withMessage('Status must be valid')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    const animalId = generateId();
    
    await runQuery(db, `
      INSERT INTO animals (
        id, name, species, scientific_name, description, habitat, diet, fun_fact,
        location, status, image_url, age, weight, arrival_date, last_checkup,
        caretaker, dietary_needs, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      animalId,
      req.body.name,
      req.body.species,
      req.body.scientific_name || null,
      req.body.description || null,
      req.body.habitat || null,
      req.body.diet || null,
      req.body.fun_fact || null,
      req.body.location,
      req.body.status,
      req.body.image_url || null,
      req.body.age || null,
      req.body.weight || null,
      req.body.arrival_date || null,
      req.body.last_checkup || null,
      req.body.caretaker || null,
      req.body.dietary_needs || null
    ]);
    
    const newAnimal = await getRow(db, 'SELECT * FROM animals WHERE id = ?', [animalId]);
    res.status(201).json(newAnimal);
  } catch (error) {
    console.error('Error creating animal:', error);
    res.status(500).json({ error: 'Failed to create animal' });
  }
});

// Update animal
router.put('/:id', [
  param('id').notEmpty().withMessage('Animal ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    
    // Check if animal exists
    const existingAnimal = await getRow(db, 'SELECT * FROM animals WHERE id = ?', [req.params.id]);
    if (!existingAnimal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    const updateFields = [];
    const updateValues = [];
    
    // Build dynamic update query
    const allowedFields = [
      'name', 'species', 'scientific_name', 'description', 'habitat', 'diet', 'fun_fact',
      'location', 'status', 'image_url', 'age', 'weight', 'arrival_date', 'last_checkup',
      'caretaker', 'dietary_needs'
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
    
    updateFields.push('updated_at = datetime(\'now\')');
    updateValues.push(req.params.id);
    
    const updateQuery = `UPDATE animals SET ${updateFields.join(', ')} WHERE id = ?`;
    await runQuery(db, updateQuery, updateValues);
    
    const updatedAnimal = await getRow(db, 'SELECT * FROM animals WHERE id = ?', [req.params.id]);
    res.json(updatedAnimal);
  } catch (error) {
    console.error('Error updating animal:', error);
    res.status(500).json({ error: 'Failed to update animal' });
  }
});

// Delete animal
router.delete('/:id', [
  param('id').notEmpty().withMessage('Animal ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    
    // Check if animal exists
    const existingAnimal = await getRow(db, 'SELECT * FROM animals WHERE id = ?', [req.params.id]);
    if (!existingAnimal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    // Delete related records first (foreign key constraints)
    await runQuery(db, 'DELETE FROM health_reports WHERE animal_id = ?', [req.params.id]);
    await runQuery(db, 'DELETE FROM user_favorites WHERE animal_id = ?', [req.params.id]);
    
    // Delete the animal
    await runQuery(db, 'DELETE FROM animals WHERE id = ?', [req.params.id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting animal:', error);
    res.status(500).json({ error: 'Failed to delete animal' });
  }
});

// Get animals by status
router.get('/status/:status', [
  param('status').isIn(['Healthy', 'Under observation', 'Scheduled for checkup', 'Treatment required'])
    .withMessage('Invalid status')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    const animals = db.prepare('SELECT * FROM animals WHERE status = ? ORDER BY name').all(req.params.status);
    res.json(animals);
  } catch (error) {
    console.error('Error fetching animals by status:', error);
    res.status(500).json({ error: 'Failed to fetch animals by status' });
  }
});

// Search animals
router.get('/search/:query', [
  param('query').notEmpty().withMessage('Search query is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    const searchTerm = `%${req.params.query}%`;
    const animals = db.prepare(`
      SELECT * FROM animals 
      WHERE name LIKE ? OR species LIKE ? OR description LIKE ? OR habitat LIKE ?
      ORDER BY name
    `).all(searchTerm, searchTerm, searchTerm, searchTerm);
    
    res.json(animals);
  } catch (error) {
    console.error('Error searching animals:', error);
    res.status(500).json({ error: 'Failed to search animals' });
  }
});

module.exports = router;
