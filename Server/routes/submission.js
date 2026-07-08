const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/submission/submit
// @desc    Submit candidate answers for an exam
// @access  Private/Student
router.post('/submit', protect, authorize('student'), async (req, res) => {
  const { examId, answers, status } = req.body; // answers is a Map/Object: { "0": 1, "1": 2 } (index to option index)

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
      const selectedIndex = answers[index.toString()] !== undefined
        ? Number(answers[index.toString()])
        : answers[index] !== undefined
          ? Number(answers[index])
          : undefined;
      if (selectedIndex !== undefined && selectedIndex === question.correctOption) {
        const pts = Number(question.marks) || 1; // use `marks` (Exam schema field), fallback to 1
        score += pts;
      }
    });
    // Safety guard: ensure score is a valid number before saving
    if (isNaN(score) || !isFinite(score)) score = 0;

    const submission = await Submission.create({
      student: req.user._id,
      exam: examId,
      answers,
      score,
      status: status || 'submitted',
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

// @route   GET /api/submission/check/:examId
// @desc    Check if current student already submitted a specific exam
// @access  Private/Student
router.get('/check/:examId', protect, authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      student: req.user._id,
      exam: req.params.examId,
    });
    res.json({ submitted: !!submission, submission: submission || null });
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
      .populate('student', 'name uid photoLink faceImageLink')
      .populate('exam', 'title subject');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/submission/exam/:examId
// @desc    Get all submissions for a specific exam (with student answers) — for examiner review
// @access  Private/Examiner/Admin
router.get('/exam/:examId', protect, authorize('examiner', 'admin'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const submissions = await Submission.find({ exam: req.params.examId })
      .populate('student', 'name uid photoLink faceImageLink')
      .sort({ submittedAt: -1 });

    res.json({ exam, submissions });
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

// @route   GET /api/submission/review/:examId
// @desc    Get exam questions with correct answers for review after submission
// @access  Private/Student
router.get('/review/:examId', protect, authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      student: req.user._id,
      exam: req.params.examId
    }).populate('exam');

    if (!submission) {
      return res.status(403).json({ message: 'You have not submitted this exam yet. Review is unavailable.' });
    }

    res.json({
      exam: submission.exam,
      submission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
