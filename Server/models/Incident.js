const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  time: {
    type: Date,
    default: Date.now,
  },
  label: {
    type: String,
    required: true,
  },
  sub: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['tab_switch', 'multiple_persons', 'audio', 'start', 'submit'],
    default: 'tab_switch',
  },
});

const IncidentSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  timeline: [TimelineEventSchema],
  status: {
    type: String,
    enum: ['pending', 'resolved', 'flagged'],
    default: 'pending',
  },
  referenceImage: {
    type: String,
    default: '',
  },
  incidentSnapshot: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Incident', IncidentSchema);
