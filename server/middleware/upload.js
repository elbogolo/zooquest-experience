const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// File type validation
const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024; // 5MB

// Configure multer for memory storage (we'll process with sharp)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize
  }
});

// Image processing utility
const processImage = async (buffer, filename, category) => {
  const uploadsDir = path.join(__dirname, '../uploads', category);
  
  // Ensure directory exists
  await fs.mkdir(uploadsDir, { recursive: true });

  const imagePath = path.join(uploadsDir, filename);
  
  // Process image with sharp
  await sharp(buffer)
    .resize(800, 600, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ 
      quality: 85,
      progressive: true 
    })
    .toFile(imagePath);

  // Create thumbnail
  const thumbnailPath = path.join(uploadsDir, `thumb_${filename}`);
  await sharp(buffer)
    .resize(300, 300, { 
      fit: 'cover' 
    })
    .jpeg({ 
      quality: 80 
    })
    .toFile(thumbnailPath);

  return {
    originalPath: imagePath,
    thumbnailPath,
    filename,
    thumbnailFilename: `thumb_${filename}`,
    url: `/uploads/${category}/${filename}`,
    thumbnailUrl: `/uploads/${category}/thumb_${filename}`
  };
};

// Generate unique filename
const generateFilename = (originalname) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalname).toLowerCase();
  return `${timestamp}_${randomString}${ext}`;
};

// Delete image files
const deleteImage = async (filename, category) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads', category);
    const imagePath = path.join(uploadsDir, filename);
    const thumbnailPath = path.join(uploadsDir, `thumb_${filename}`);

    // Delete original and thumbnail
    await Promise.allSettled([
      fs.unlink(imagePath),
      fs.unlink(thumbnailPath)
    ]);

    console.log(`Deleted image: ${filename}`);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

module.exports = {
  upload,
  processImage,
  generateFilename,
  deleteImage,
  allowedMimeTypes,
  maxFileSize
};
