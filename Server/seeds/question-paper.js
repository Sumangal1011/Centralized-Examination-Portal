const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const User = require("../models/User");
const Exam = require("../models/Exam");

const questions = [
  {
    id: 1,
    text: "Which data structure follows the FIFO principle?",
    type: "MULTIPLE CHOICE",
    points: 2,
    options: ["Stack", "Queue", "Tree", "Graph"],
    correctOption: 1,
  },
  {
    id: 2,
    text: "Which language is primarily used for web page styling?",
    type: "MULTIPLE CHOICE",
    points: 2,
    options: ["Python", "HTML", "CSS", "Java"],
    correctOption: 2,
  },
  {
    id: 3,
    text: "JavaScript is a compiled language.",
    type: "TRUE OR FALSE",
    points: 1,
    options: ["True", "False"],
    correctOption: 1,
  },
  {
    id: 4,
    text: "Which database is a NoSQL database?",
    type: "MULTIPLE CHOICE",
    points: 2,
    options: ["MySQL", "Oracle", "MongoDB", "PostgreSQL"],
    correctOption: 2,
  },
  {
    id: 5,
    text: "Which protocol is used for secure communication over the Internet?",
    type: "MULTIPLE CHOICE",
    points: 2,
    options: ["HTTP", "FTP", "HTTPS", "SMTP"],
    correctOption: 2,
  },
  {
    id: 6,
    text: "CPU stands for?",
    type: "MULTIPLE CHOICE",
    points: 2,
    options: [
      "Central Processing Unit",
      "Computer Processing Unit",
      "Central Programming Unit",
      "Computer Programming Utility",
    ],
    correctOption: 0,
  },
  {
    id: 7,
    text: "Binary Search works only on sorted arrays.",
    type: "TRUE OR FALSE",
    points: 1,
    options: ["True", "False"],
    correctOption: 0,
  },
  {
    id: 8,
    text: "Which HTML tag is used to create a hyperlink?",
    type: "MULTIPLE CHOICE",
    points: 2,
    options: ["<link>", "<a>", "<href>", "<url>"],
    correctOption: 1,
  },
  {
    id: 9,
    text: "Which company developed React?",
    type: "MULTIPLE CHOICE",
    points: 2,
    options: ["Google", "Microsoft", "Meta", "Amazon"],
    correctOption: 2,
  },
  {
    id: 10,
    text: "Explain the difference between a Stack and a Queue.",
    type: "SHORT ANSWER",
    points: 5,
    options: [""],
    correctOption: 0,
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Database Connected");

    // Remove previous exams only
    await Exam.deleteMany({});

    // Find existing examiner
    let examiner = await User.findOne({ uid: "E-98765432" });

    // Create examiner only if not found
    if (!examiner) {
      examiner = await User.create({
        uid: "E-98765432",
        name: "Dr. Sarah Jenkins",
        password: "examiner123",
        role: "examiner",
      });

      console.log("✅ Examiner created");
    } else {
      console.log("✅ Existing examiner found");
    }

    const exam = await Exam.create({
      title: "Computer Science Fundamentals",
      subject: "Computer Science",
      duration: 60,
      createdBy: examiner._id,
      questions,
    });

    console.log("\n=================================");
    console.log("Exam Created Successfully");
    console.log("Title:", exam.title);
    console.log("Subject:", exam.subject);
    console.log("Duration:", exam.duration, "minutes");
    console.log("Total Questions:", exam.questions.length);
    console.log("=================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
  }
};

seedData();