import mongoose from 'mongoose';

const alumniSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  studentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Supply Chain And Information System'
    ],
  },
  year: {
    type: String,
    required: true,
    trim: true,
  },
  quote: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  linkedin: {
    type: String,
    default: '',
  },
  photoUrl: {
    type: String,
    default: null,
  },
  isApproved: {
    type: Boolean,
    default: true, // Set to false if you want admin moderation before profiles appear
  }
}, {
  timestamps: true
});

const Alumni = mongoose.model('Alumni', alumniSchema);

export default Alumni;
