require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const Incident = require('../models/Incident');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Exam.deleteMany();
    await Submission.deleteMany();
    await Incident.deleteMany();
    console.log('Existing database records cleared.');

    // 1. Create Users
    // NOTE: Pre-save middleware automatically hashes passwords
    const student = new User({
      uid: 'L-12345678',
      name: 'Alex Johnson',
      password: 'student123',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256',
    });

    const examiner = new User({
      uid: 'E-98765432',
      name: 'Dr. Sarah Jenkins',
      password: 'examiner123',
      role: 'examiner',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256',
    });

    const admin = new User({
      uid: 'A-11112222',
      name: 'Super Admin',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256',
    });

    await student.save();
    await examiner.save();
    await admin.save();
    console.log('Default users successfully created:');
    console.log(' - Student: UID: L-12345678, Password: student123');
    console.log(' - Examiner: UID: E-98765432, Password: examiner123');
    console.log(' - Admin: UID: A-11112222, Password: admin123');

    // 2. Create Exams
    const exam1 = await Exam.create({
      title: 'Advanced Calculus Final Exam',
      subject: 'Mathematics',
      duration: 45,
      createdBy: admin._id,
      questions: [
        {
          id: 1,
          text: 'Which of the following defines the fundamental theorem of calculus for a continuous function f on the interval [a, b]?',
          type: 'MULTIPLE CHOICE',
          points: 4,
          options: [
            'The derivative of an integral is the original function evaluated at the upper limit.',
            'The integral of a function is always equal to its derivative at any given point c.',
            'The area under a curve is calculated by the sum of its infinite rectangles without a limit.',
            'Calculus is defined strictly by limits of sequences approaching a predefined constant.',
          ],
          correctOption: 0,
        },
        {
          id: 2,
          text: 'Which sorting algorithm has the best average-case time complexity of O(n log n)?',
          type: 'MULTIPLE CHOICE',
          points: 3,
          options: [
            'Bubble Sort',
            'Merge Sort',
            'Insertion Sort',
            'Selection Sort',
          ],
          correctOption: 1,
        },
        {
          id: 3,
          text: 'What is the time complexity of searching in a balanced Binary Search Tree?',
          type: 'MULTIPLE CHOICE',
          points: 5,
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          correctOption: 2,
        },
      ],
    });

    const exam2 = await Exam.create({
      title: 'Algorithms & Complexities Midterm',
      subject: 'Computer Science',
      duration: 60,
      createdBy: admin._id,
      questions: [
        {
          id: 1,
          text: 'What is the worst-case space complexity of Depth First Search (DFS) on a graph of depth d?',
          type: 'MULTIPLE CHOICE',
          points: 5,
          options: ['O(1)', 'O(d)', 'O(V)', 'O(V + E)'],
          correctOption: 1,
        },
        {
          id: 2,
          text: 'Which of the following statements about NP-complete problems is correct?',
          type: 'MULTIPLE CHOICE',
          points: 5,
          options: [
            'They can be solved in polynomial time by a deterministic Turing machine.',
            'If any NP-complete problem can be solved in polynomial time, then P = NP.',
            'They do not belong to the class NP.',
            'Halting problem is an NP-complete problem.',
          ],
          correctOption: 1,
        },
      ],
    });

    console.log('Default exams created.');

    // 3. Create Sample Incidents
    await Incident.create({
      caseNumber: 'AX-4092',
      student: student._id,
      exam: exam1._id,
      riskScore: 94,
      status: 'pending',
      timeline: [
        {
          time: new Date(Date.now() - 3600000), // 1hr ago
          label: 'Exam Started',
          sub: 'Student checked in and verified',
          type: 'start',
        },
        {
          time: new Date(Date.now() - 2500000), // 40m ago
          label: 'Tab Switch Detected',
          sub: 'Duration: 14s · Target: "calculus_helper.io"',
          type: 'tab_switch',
        },
        {
          time: new Date(Date.now() - 1500000), // 25m ago
          label: 'Multiple Persons Detected',
          sub: 'AI Confidence: 98.4%',
          type: 'multiple_persons',
        },
        {
          time: new Date(Date.now() - 1000000), // 16m ago
          label: 'Suspicious Audio Pattern',
          sub: 'Whispering detected',
          type: 'audio',
        },
      ],
    });

    console.log('Sample incident violation reports created.');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
