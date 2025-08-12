const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getDatabase, generateId, getRows, getRow, runQuery } = require('../database/init');

const router = express.Router();

// Get all health reports
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const healthReports = await getRows(db, `
      SELECT hr.*, a.name as animal_name, a.species as animal_species
      FROM health_reports hr
      LEFT JOIN animals a ON hr.animal_id = a.id
      ORDER BY hr.report_date DESC
    `);
    res.json(healthReports);
  } catch (error) {
    console.error('Error fetching health reports:', error);
    res.status(500).json({ error: 'Failed to fetch health reports' });
  }
});

// Get health reports for a specific animal
router.get('/animal/:animalId', [
  param('animalId').notEmpty().withMessage('Animal ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    const healthReports = await getRows(db, `
      SELECT hr.*, a.name as animal_name, a.species as animal_species
      FROM health_reports hr
      LEFT JOIN animals a ON hr.animal_id = a.id
      WHERE hr.animal_id = ?
      ORDER BY hr.report_date DESC
    `, [req.params.animalId]);
    res.json(healthReports);
  } catch (error) {
    console.error('Error fetching health reports for animal:', error);
    res.status(500).json({ error: 'Failed to fetch health reports for animal' });
  }
});

// Create new health report
router.post('/', [
  body('animal_id').notEmpty().withMessage('Animal ID is required'),
  body('report_date').isISO8601().withMessage('Valid report date is required'),
  body('veterinarian').notEmpty().withMessage('Veterinarian is required'),
  body('health_status').isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Critical'])
    .withMessage('Health status must be valid'),
  body('findings').notEmpty().withMessage('Findings are required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getDatabase();
    
    // Verify animal exists
    const animal = await getRow(db, 'SELECT * FROM animals WHERE id = ?', [req.body.animal_id]);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const reportId = generateId();
    const now = new Date().toISOString();
    
    await runQuery(db, `
      INSERT INTO health_reports (
        id, animal_id, report_date, veterinarian, health_status, weight, temperature,
        findings, treatment, medications, follow_up_date, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reportId,
      req.body.animal_id,
      req.body.report_date,
      req.body.veterinarian,
      req.body.health_status,
      req.body.weight || null,
      req.body.temperature || null,
      req.body.findings,
      req.body.treatment || null,
      req.body.medications || null,
      req.body.follow_up_date || null,
      req.body.notes || null,
      now,
      now
    ]);
    
    const newReport = await getRow(db, `
      SELECT hr.*, a.name as animal_name, a.species as animal_species
      FROM health_reports hr
      LEFT JOIN animals a ON hr.animal_id = a.id
      WHERE hr.id = ?
    `, [reportId]);
    
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating health report:', error);
    res.status(500).json({ error: 'Failed to create health report' });
  }
});

module.exports = router;
