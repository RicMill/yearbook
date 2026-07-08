import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Alumni from './models/Alumni.js';

// Load environment variables
dotenv.config();

const defaultStudents = [
  // Class of 2022
  { name: 'Marcus Johnson', department: 'Accounting and Finance', year: '2022', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', quote: '"The beginning of something great."' },
  { name: 'Evans amoah', department: 'Supply Chain and Information Systems', year: '2022', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', quote: '"Numbers don\'t lie, but I do on Mondays."' },
  { name: 'Rafael Mendez', department: 'Marketing and International Business', year: '2022', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', quote: '"E = mc² and vibes."' },
  { name: 'Amara Osei', department: 'Human Resource and Organizational Development', year: '2022', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', quote: '"Building dreams, literally."' },
  { name: 'Priya Sharma', department: 'Hospitality', year: '2022', photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', quote: '"Good chemistry is hard to find."' },
  { name: 'Liam Carter', department: 'Accounting and Finance', year: '2022', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', quote: '"Survived the first semester, barely."' },
  { name: 'Sofia Reyes', department: 'Supply Chain and Information Systems', year: '2022', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', quote: '"Designing my own future."' },
  { name: 'Daniel Kim', department: 'Marketing and International Business', year: '2022', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', quote: '"Supply of sleep: zero."' },
  
  // Class of 2023
  { name: 'Olivia Chen', department: 'Marketing and International Business', year: '2023', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', quote: '"Ctrl+Z is my love language."' },
  { name: 'Noah Williams', department: 'Human Resource and Organizational Development', year: '2023', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', quote: '"If it ain\'t broke, I\'ll fix it anyway."' },
  { name: 'Isabella Torres', department: 'Hospitality', year: '2023', photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', quote: '"Life is my canvas."' },
  { name: 'Kwame Mensah', department: 'Accounting and Finance', year: '2023', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', quote: '"Calculated every risk except this one."' },
  { name: 'Aisha Mohammed', department: 'Supply Chain and Information Systems', year: '2023', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', quote: '"We have great chemistry, don\'t we?"' },
  
  // Class of 2024
  { name: 'Emma Richardson', department: 'Marketing and International Business', year: '2024', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', quote: '"404: Sleep not found."' },
  { name: 'David Okafor', department: 'Human Resource and Organizational Development', year: '2024', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', quote: '"Built different. Literally."' },
  { name: 'Sakura Ito', department: 'Hospitality', year: '2024', photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', quote: '"Making the world prettier, one pixel at a time."' },
  { name: 'Andre Baptiste', department: 'Accounting and Finance', year: '2024', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', quote: '"In this universe, I chose chaos."' },
  { name: 'Zara Hussain', department: 'Supply Chain and Information Systems', year: '2024', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', quote: '"Healing hearts, breaking curves."' },
  
  // Class of 2025
  { name: 'Charlotte Evans', department: 'Hospitality', year: '2025', photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', quote: '"git commit -m \'survived\'"' },
  { name: 'Michael Adekunle', department: 'Accounting and Finance', year: '2025', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', quote: '"Engineer by day, DJ by night."' },
  { name: 'Aria Patel', department: 'Supply Chain and Information Systems', year: '2025', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', quote: '"Prescribing good vibes only."' },
  { name: 'Benjamin Costa', department: 'Marketing and International Business', year: '2025', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', quote: '"My plans are structurally sound."' },
  { name: 'Nadia Volkov', department: 'Human Resource and Organizational Development', year: '2025', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', quote: '"∞ reasons to keep going."' },

  // Class of 2026
  { name: 'Marcus Johnson', department: 'Human Resource and Organizational Development', year: '2026', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', quote: '"From printf to production."' },
  { name: 'Yuki Tanaka', department: 'Hospitality', year: '2026', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', quote: '"The limit does not exist for us."' },
  { name: 'Rafael Mendez', department: 'Accounting and Finance', year: '2026', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', quote: '"We bent the rules of physics to be here."' },
  { name: 'Amara Osei', department: 'Supply Chain and Information Systems', year: '2026', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', quote: '"Engineered a life worth living."' },
  { name: 'Priya Sharma', department: 'Marketing and International Business', year: '2026', photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', quote: '"The best reaction was meeting you all."' },
  { name: 'Liam Carter', department: 'Human Resource and Organizational Development', year: '2026', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', quote: '"Grew into who I was meant to be."' },
  { name: 'Sofia Reyes', department: 'Hospitality', year: '2026', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', quote: '"I built friendships that will last forever."' },
  { name: 'Daniel Kim', department: 'Accounting and Finance', year: '2026', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', quote: '"The ROI of this journey? Priceless."' },
  { name: 'Fatima Al-Rashid', department: 'Supply Chain and Information Systems', year: '2026', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', quote: '"Healing the world, starting with us."' },
];


const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await Alumni.deleteMany({});
    console.log('Cleared existing Alumni collection.');

    // Drop old index so it can be rebuilt with the new 'sparse' configuration
    await Alumni.collection.dropIndex('email_1').catch(() => {});
    console.log('Dropped old email index to allow sparse index recreation.');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Ghana@2024', salt);

    const seededStudents = defaultStudents.map((student, idx) => {
      // Override year and department per user request
      const year = '2026';
      const department = 'Supply Chain And Information System';
      const studentNumber = `${year}${String(idx + 1000).padStart(4, '0')}`;
      
      // All students are unclaimed/unregistered by default
      return {
        ...student,
        year,
        department,
        photoUrl: null,
        studentNumber,
        email: undefined,
        password: undefined,
        isRegistered: false,
        bio: '',
        linkedin: '',
        isApproved: true
      };
    });

    await Alumni.insertMany(seededStudents);
    console.log(`Seeded ${seededStudents.length} alumni profiles (all unclaimed).`);
    console.log(`👉 Test Claim Student Number: "${seededStudents[1].studentNumber}" (Name: ${seededStudents[1].name}, Class of ${seededStudents[1].year})`);


    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
