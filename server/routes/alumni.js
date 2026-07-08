import express from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Alumni from '../models/Alumni.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yearbook-portraits',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: (req, file) => 'portrait-' + Date.now() + '-' + Math.round(Math.random() * 1e9),
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});


/**
 * @route   GET /api/alumni/albums
 * @desc    Get graduating years with student count, and total memory count
 * @access  Public
 */
router.get('/albums', async (req, res) => {
  try {
    const studentCounts = await Alumni.aggregate([
      { $match: { isApproved: true, isRegistered: true, photoUrl: { $ne: null } } },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const years = studentCounts.map((item) => ({
      year: item._id,
      count: item.count
    }));

    res.json({
      years
    });
  } catch (error) {
    console.error('Fetch albums stats error:', error.message);
    res.status(500).json({ message: 'Server error retrieving albums stats' });
  }
});

/**
 * @route   GET /api/alumni/departments
 * @desc    Get distinct departments that have students (optionally filtered by year)
 * @access  Public
 */
router.get('/departments', async (req, res) => {
  const { year } = req.query;
  const filter = { isApproved: true, isRegistered: true, photoUrl: { $ne: null } };
  if (year) {
    filter.year = year;
  }

  try {
    const departmentsList = await Alumni.distinct('department', filter);
    res.json(departmentsList);
  } catch (error) {
    console.error('Fetch departments error:', error.message);
    res.status(500).json({ message: 'Server error retrieving departments' });
  }
});

/**
 * @route   GET /api/alumni
 * @desc    Get alumni profiles filtered by year and/or department
 * @access  Public
 */
router.get('/', async (req, res) => {
  const { year, department } = req.query;
  const filter = { isApproved: true, isRegistered: true, photoUrl: { $ne: null } };

  if (year) {
    filter.year = year;
  }
  if (department) {
    filter.department = department;
  }

  try {
    const graduates = await Alumni.find(filter)
      .select('-password -email -studentNumber') // Hide private fields from public view
      .sort({ name: 1 });

    res.json(graduates);
  } catch (error) {
    console.error('Fetch graduates error:', error.message);
    res.status(500).json({ message: 'Server error retrieving graduates' });
  }
});

/**
 * @route   PUT /api/alumni/profile
 * @desc    Update current alumni profile details
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.user._id);

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }

    // Update allowable fields
    const fieldsToUpdate = ['name', 'department', 'year', 'quote', 'bio', 'linkedin', 'photoUrl'];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        alumni[field] = req.body[field];
      }
    });

    const updatedAlumni = await alumni.save();

    res.json({
      id: updatedAlumni._id,
      name: updatedAlumni.name,
      studentNumber: updatedAlumni.studentNumber,
      email: updatedAlumni.email,
      department: updatedAlumni.department,
      year: updatedAlumni.year,
      quote: updatedAlumni.quote,
      bio: updatedAlumni.bio,
      linkedin: updatedAlumni.linkedin,
      photoUrl: updatedAlumni.photoUrl,
      isApproved: updatedAlumni.isApproved,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

/**
 * @route   POST /api/alumni/upload-photo
 * @desc    Upload alumni portrait photo
 * @access  Private
 */
router.post('/upload-photo', protect, (req, res) => {
  upload.single('photo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Upload Error:', err);
      // A Multer error occurred when uploading.
      return res.status(400).json({ message: `Multer upload error: ${err.message}` });
    } else if (err) {
      console.error('Upload Error:', err);
      // An unknown error occurred when uploading.
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      console.log('No req.file found! req.body:', req.body, 'req.file:', req.file);
      return res.status(400).json({ message: 'Please upload a photo file' });
    }

    // Return the Cloudinary URL to be saved in database
    const photoUrl = req.file.path;
    res.json({ photoUrl });
  });
});


export default router;
