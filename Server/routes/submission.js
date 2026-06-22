const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/submission/submit
// @desc    Submit candidate answers for an exam
// @access  Private/Student
router.post('/submit', protect, authorize('student'), async (req, res) => {
  const { examId, answers } = req.body; // answers is a Map/Object: { "0": 1, "1": 2 } (index to option index)

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user already submitted for this exam
    const existingSubmission = await Submission.findOne({
      student: req.user._id,
      exam: examId,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this exam.' });
    }

    // Calculate score
    let score = 0;
    exam.questions.forEach((question, index) => {
      const selectedIndex = answers[index.toString()] !== undefined ? answers[index.toString()] : answers[index];
      if (selectedIndex !== undefined && selectedIndex === question.correctOption) {
        score += question.points;
      }
    });

    const submission = await Submission.create({
      student: req.user._id,
      exam: examId,
      answers,
      score,
      status: 'submitted',
    });

    res.status(201).json({
      message: 'Exam submitted successfully',
      submissionId: submission._id,
      score,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/submission/list
// @desc    Get all exam submissions
// @access  Private/Examiner/Admin
router.get('/list', protect, authorize('examiner', 'admin'), async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('student', 'name uid')
      .populate('exam', 'title subject');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/submission/my-submissions
// @desc    Get student's own submissions
// @access  Private/Student
router.get('/my-submissions', protect, authorize('student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('exam', 'title subject duration');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
