const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});


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
    const student1 = new User({
      uid: 'L-12345678',
      name: 'Alex Johnson',
      password: 'student123',
      role: 'student'
    });

    const examiner1 = new User({
      uid: 'E-98765432',
      name: 'Dr. Sarah Jenkins',
      password: 'examiner123',
      role: 'examiner'
    });

    const admin1 = new User({
      uid: 'A-11112222',
      name: 'Super Admin',
      password: 'admin123',
      role: 'admin'
    });
     const student2 = new User({
      uid: 'S-20600223055',
      name: 'Sumangal Kayal',
      password: 'sumangal.123',
      role: 'student'
      });

    const savedStudent1 = await student1.save();
    console.log('Student Saved:', savedStudent1._id);

    const savedExaminer1 = await examiner1.save();
    console.log('Examiner Saved:', savedExaminer1._id);

    const savedAdmin1 = await admin1.save();
    console.log('Admin Saved:', savedAdmin1._id);

    const savedStudent2 = await student2.save();
    console.log('Student Saved:', savedStudent2._id);

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