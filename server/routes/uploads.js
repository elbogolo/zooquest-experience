const express = require('express');
const router = express.Router();
const { upload, processImage, generateFilename, deleteImage } = require('../middleware/upload');
const { verifyToken } = require('./auth');
const { getDatabase, runQuery, getRow } = require('../database/init');

// Upload animal image
router.post('/animals/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Check if animal exists
    const db = getDatabase();
    const animal = await new Promise((resolve, reject) => {
      getRow(db, 'SELECT * FROM animals WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Delete old image if exists
    if (animal.image_url) {
      const oldFilename = animal.image_url.split('/').pop();
      await deleteImage(oldFilename, 'animals');
    }

    // Process new image
    const filename = generateFilename(file.originalname);
    const imageData = await processImage(file.buffer, filename, 'animals');

    // Update animal record with new image URL
    await new Promise((resolve, reject) => {
      runQuery(db, 'UPDATE animals SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [imageData.url, id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageData.url,
      thumbnailUrl: imageData.thumbnailUrl
    });

  } catch (error) {
    console.error('Error uploading animal image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload event image
router.post('/events/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Check if event exists
    const db = getDatabase();
    const event = await new Promise((resolve, reject) => {
      getRow(db, 'SELECT * FROM events WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete old image if exists
    if (event.image_url) {
      const oldFilename = event.image_url.split('/').pop();
      await deleteImage(oldFilename, 'events');
    }

    // Process new image
    const filename = generateFilename(file.originalname);
    const imageData = await processImage(file.buffer, filename, 'events');

    // Update event record with new image URL
    await new Promise((resolve, reject) => {
      runQuery(db, 'UPDATE events SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [imageData.url, id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageData.url,
      thumbnailUrl: imageData.thumbnailUrl
    });

  } catch (error) {
    console.error('Error uploading event image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload profile image
router.post('/profile', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get current user
    const db = getDatabase();
    const user = await new Promise((resolve, reject) => {
      getRow(db, 'SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old profile image if exists
    if (user.profile_image) {
      const oldFilename = user.profile_image.split('/').pop();
      await deleteImage(oldFilename, 'profiles');
    }

    // Process new image
    const filename = generateFilename(file.originalname);
    const imageData = await processImage(file.buffer, filename, 'profiles');

    // Update user record with new profile image URL
    await new Promise((resolve, reject) => {
      runQuery(db, 'UPDATE users SET profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [imageData.url, userId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: imageData.url,
      thumbnailUrl: imageData.thumbnailUrl
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// Delete animal image
router.delete('/animals/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get animal to find current image
    const db = getDatabase();
    const animal = await new Promise((resolve, reject) => {
      getRow(db, 'SELECT * FROM animals WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    if (animal.image_url) {
      // Delete image files
      const filename = animal.image_url.split('/').pop();
      await deleteImage(filename, 'animals');

      // Update database to remove image URL
      await new Promise((resolve, reject) => {
        runQuery(db, 'UPDATE animals SET image_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    res.json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Error deleting animal image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Get image info
router.get('/info/:category/:filename', (req, res) => {
  const { category, filename } = req.params;
  const path = require('path');
  const fs = require('fs');

  const imagePath = path.join(__dirname, '../uploads', category, filename);
  
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    res.json({
      exists: true,
      size: stats.size,
      lastModified: stats.mtime,
      url: `/uploads/${category}/${filename}`
    });
  } else {
    res.status(404).json({ exists: false });
  }
});

module.exports = router;
