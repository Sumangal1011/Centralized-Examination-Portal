const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/incident/report
// @desc    Report/Log a proctoring violation incident
// @access  Private/Student
router.post('/report', protect, authorize('student'), async (req, res) => {
  const { examId, riskScore, eventLabel, eventSub, eventType, caseNumber, referenceImage, incidentSnapshot } = req.body;

  try {
    let incident = await Incident.findOne({ student: req.user._id, exam: examId });

    const newEvent = {
      time: new Date(),
      label: eventLabel,
      sub: eventSub || '',
      type: eventType || 'tab_switch',
    };

    if (incident) {
      // Append to existing incident log
      incident.timeline.push(newEvent);
      // Update risk score to the maximum or average
      if (riskScore !== undefined) {
        incident.riskScore = Math.max(incident.riskScore, riskScore);
      }
      if (incidentSnapshot) {
        incident.incidentSnapshot = incidentSnapshot;
      }
      await incident.save();
    } else {
      // Create new case
      const code = caseNumber || `AX-${Math.floor(1000 + Math.random() * 9000)}`;
      incident = await Incident.create({
        caseNumber: code,
        student: req.user._id,
        exam: examId,
        riskScore: riskScore || 0,
        timeline: [newEvent],
        referenceImage: referenceImage || '',
        incidentSnapshot: incidentSnapshot || '',
      });
    }

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/incident/list
// @desc    Get all proctoring incidents
// @access  Private/Examiner/Admin
router.get('/list', protect, authorize('examiner', 'admin'), async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('student', 'name uid')
      .populate('exam', 'title subject')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/incident/:id
// @desc    Get details of a single incident case by ID or caseNumber
// @access  Private/Examiner/Admin
router.get('/:id', protect, authorize('examiner', 'admin'), async (req, res) => {
  try {
    const query = req.params.id.startsWith('AX-') 
      ? { caseNumber: req.params.id }
      : { _id: req.params.id };

    const incident = await Incident.findOne(query)
      .populate('student', 'name uid')
      .populate('exam', 'title subject');

    if (!incident) {
      return res.status(404).json({ message: 'Incident case not found' });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/incident/:id/status
// @desc    Update incident case status
// @access  Private/Examiner/Admin
router.put('/:id/status', protect, authorize('examiner', 'admin'), async (req, res) => {
  const { status } = req.body;

  try {
    const query = req.params.id.startsWith('AX-') 
      ? { caseNumber: req.params.id }
      : { _id: req.params.id };

    const incident = await Incident.findOne(query);

    if (!incident) {
      return res.status(404).json({ message: 'Incident case not found' });
    }

    incident.status = status;
    await incident.save();

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
