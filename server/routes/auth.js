import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Alumni from '../models/Alumni.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @route   POST /api/auth/verify-student
 * @desc    Verify if student exists and is eligible to claim their account
 * @access  Public
 */
router.post('/verify-student', async (req, res) => {
  const { studentNumber } = req.body;

  try {
    if (!studentNumber) {
      return res.status(400).json({ message: 'Please enter your student number' });
    }

    const student = await Alumni.findOne({ studentNumber });

    if (!student) {
      return res.status(404).json({ 
        message: 'Student number not found in our database. Please contact school administration.' 
      });
    }

    if (student.isRegistered) {
      return res.status(400).json({ 
        message: 'This student number has already claimed their account. Please log in.' 
      });
    }

    // Return student details for verification
    res.json({
      name: student.name,
      department: student.department,
      year: student.year,
    });
  } catch (error) {
    console.error('Verify student error:', error.message);
    res.status(500).json({ message: 'Server error verifying student' });
  }
});

/**
 * @route   POST /api/auth/claim-account
 * @desc    Claim an pre-seeded student account (set email, password, etc)
 * @access  Public
 */
router.post('/claim-account', async (req, res) => {
  const { studentNumber, email, password, name, department, year } = req.body;

  try {
    if (!studentNumber || !email || !password || !name || !department || !year) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find the student record
    const student = await Alumni.findOne({ studentNumber });

    if (!student) {
      return res.status(404).json({ message: 'Student record not found.' });
    }

    if (student.isRegistered) {
      return res.status(400).json({ message: 'This account has already been claimed.' });
    }

    // Check if the email is already in use by a claimed account
    const emailExists = await Alumni.findOne({ email, isRegistered: true });
    if (emailExists) {
      return res.status(400).json({ message: 'This email address is already registered.' });
    }

    // Hash the chosen password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update and activate the student's profile
    student.email = email;
    student.password = hashedPassword;
    student.name = name;
    student.department = department;
    student.year = year;
    student.isRegistered = true;

    await student.save();

    res.status(201).json({
      token: generateToken(student._id),
      user: {
        id: student._id,
        name: student.name,
        studentNumber: student.studentNumber,
        email: student.email,
        department: student.department,
        year: student.year,
        quote: student.quote,
        bio: student.bio,
        linkedin: student.linkedin,
        photoUrl: student.photoUrl,
        isApproved: student.isApproved,
      }
    });
  } catch (error) {
    console.error('Claim account error:', error.message);
    res.status(500).json({ message: 'Server error claiming account' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find alumni (only allow logged in if isRegistered is true)
    const alumni = await Alumni.findOne({ email, isRegistered: true });

    if (alumni && (await bcrypt.compare(password, alumni.password))) {
      res.json({
        token: generateToken(alumni._id),
        user: {
          id: alumni._id,
          name: alumni.name,
          studentNumber: alumni.studentNumber,
          email: alumni.email,
          department: alumni.department,
          year: alumni.year,
          quote: alumni.quote,
          bio: alumni.bio,
          linkedin: alumni.linkedin,
          photoUrl: alumni.photoUrl,
          isApproved: alumni.isApproved,
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user details
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Fetch profile error:', error.message);
    res.status(500).json({ message: 'Server error retrieving user' });
  }
});

export default router;
