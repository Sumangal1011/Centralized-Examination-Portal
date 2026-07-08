const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/exam/create
// @desc    Upload/Create a new exam paper
// @access  Private/Admin
router.post('/create', protect, authorize('admin'), async (req, res) => {
  const { title, subject, duration, questions, status } = req.body;

  try {
    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'Exam must contain at least one question' });
    }

    const exam = await Exam.create({
      title,
      subject,
      duration,
      questions,
      status: status || 'active',
      createdBy: req.user._id,
    });

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/exam/list
// @desc    Get all exams
// @access  Private
router.get('/list', protect, async (req, res) => {
  try {
    const exams = await Exam.find().populate('createdBy', 'name');

    // Secure answers for student view — also only show active exams
    if (req.user.role === 'student') {
      const sanitizedExams = exams
        .filter(exam => exam.status === 'active')
        .map(exam => {
          const examObj = exam.toObject();
          if (examObj.questions) {
            examObj.questions = examObj.questions.map(q => {
              const { correctOption, ...rest } = q;
              return rest;
            });
          }
          return examObj;
        });
      return res.json(sanitizedExams);
    }

    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/exam/:id
// @desc    Get exam by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name');

    if (!exam) {
      return res.status(404).json({ message: 'Exam paper not found' });
    }

    const examObj = exam.toObject();

    // Secure answers if requested by a student
    if (req.user.role === 'student') {
      if (examObj.questions) {
        examObj.questions = examObj.questions.map(q => {
          const { correctOption, ...rest } = q;
          return rest;
        });
      }
    }

    res.json(examObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/exam/:id/status
// @desc    Update exam status (active/draft/closed)
// @access  Private/Admin/Examiner
router.patch('/:id/status', protect, authorize('admin', 'examiner'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['draft', 'active', 'closed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be draft, active, or closed.' });
  }

  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: 'Exam paper not found' });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
