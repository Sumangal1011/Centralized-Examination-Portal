require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const Incident = require('../models/Incident');

const seedData = async () => {
  try {
    // Connect to database
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log('Database connected for seeding...');
    console.log('Database:', conn.connection.name);

    // Clear existing collections
    await User.deleteMany({});
    await Exam.deleteMany({});
    await Submission.deleteMany({});
    await Incident.deleteMany({});

    console.log('Existing database records cleared.');

    // Create Users
    const student = new User({
      uid: 'L-12345678',
      name: 'Alex Johnson',
      password: 'student123',
      role: 'student',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256',
    });

    const examiner = new User({
      uid: 'E-98765432',
      name: 'Dr. Sarah Jenkins',
      password: 'examiner123',
      role: 'examiner',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256',
    });

    const admin = new User({
      uid: 'A-11112222',
      name: 'Super Admin',
      password: 'admin123',
      role: 'admin',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256',
    });

    const savedStudent = await student.save();
    console.log('Student Saved:', savedStudent._id);

    const savedExaminer = await examiner.save();
    console.log('Examiner Saved:', savedExaminer._id);

    const savedAdmin = await admin.save();
    console.log('Admin Saved:', savedAdmin._id);

    console.log(
      'User Count:',
      await User.countDocuments()
    );

    // Continue with your Exam.create() and Incident.create() code...
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();