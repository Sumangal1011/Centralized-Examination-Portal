import { useState, useEffect } from 'react';
import { Search, Plus, ArrowLeft, Trash2, CheckCircle, Clock } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { examAPI } from '../utils/api';

export default function QuestionsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  // Creation form states
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: '',
      type: 'MULTIPLE CHOICE',
      points: 5,
      options: ['', '', '', ''],
      correctOption: 0
    }
  ]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const fetchExams = async () => {
    try {
      const data = await examAPI.list();
      setExams(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch exam papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleAddQuestionField = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        text: '',
        type: 'MULTIPLE CHOICE',
        points: 5,
        options: ['', '', '', ''],
        correctOption: 0
      }
    ]);
  };

  const handleRemoveQuestionField = (index) => {
    if (questions.length === 1) return;
    const updated = questions.filter((_, idx) => idx !== index).map((q, idx) => ({
      ...q,
      id: idx + 1
    }));
    setQuestions(updated);
  };

  const handleQuestionTextChange = (index, val) => {
    const updated = [...questions];
    updated[index].text = val;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = val;
    setQuestions(updated);
  };

  const handleCorrectOptionChange = (qIdx, val) => {
    const updated = [...questions];
    updated[qIdx].correctOption = parseInt(val, 10);
    setQuestions(updated);
  };

  const handlePointsChange = (qIdx, val) => {
    const updated = [...questions];
    updated[qIdx].points = parseInt(val, 10) || 1;
    setQuestions(updated);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      alert('Please fill out Title and Subject.');
      return;
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Question #${i+1} has empty text.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          alert(`Question #${i+1} Option ${String.fromCharCode(65+j)} is empty.`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      await examAPI.create(title, subject, duration, questions);
      alert('Exam paper uploaded successfully!');
      // Reset form
      setTitle('');
      setSubject('');
      setDuration(60);
      setQuestions([{
        id: 1,
        text: '',
        type: 'MULTIPLE CHOICE',
        points: 5,
        options: ['', '', '', ''],
        correctOption: 0
      }]);
      setIsCreating(false);
      fetchExams();
    } catch (err) {
      alert('Failed to upload exam: ' + err.message);
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(e =>
    e.title.toLowerCase().includes(query.toLowerCase()) ||
    e.subject.toLowerCase().includes(query.toLowerCase())
  );

  if (loading && exams.length === 0) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-neutral)' }}>Loading exam repository...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <TopBar
        title="ExamAI"
        rightSlot={
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#64748b,#0f172a)', border: '2px solid var(--clr-border)' }} />
        }
      />

      <div className="page-content" style={{ paddingBottom: 110 }}>
        {isCreating ? (
          // Admin Create Paper view
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setIsCreating(false)} style={{ color: 'var(--clr-primary)', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={22} />
              </button>
              <h1 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700 }}>Upload Exam Paper</h1>
            </div>

            <form onSubmit={handleSaveExam} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <h3 style={{ fontSize: 'var(--fs-label-md)', fontWeight: 600, marginBottom: 12, color: 'var(--clr-neutral)' }}>PAPER METADATA</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Exam Title</label>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="e.g. Advanced Algorithms Final"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Subject / Course Code</label>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Duration (Minutes)</label>
                    <input
                      className="input-field"
                      type="number"
                      placeholder="e.g. 60"
                      value={duration}
                      onChange={e => setDuration(parseInt(e.target.value, 10) || 0)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <h2 style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 700 }}>Questions ({questions.length})</h2>
                <button
                  type="button"
                  onClick={handleAddQuestionField}
                  style={{ color: 'var(--clr-ai-blue)', fontWeight: 600, fontSize: 'var(--fs-label-md)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>

              {questions.map((q, qIdx) => (
                <div key={q.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--clr-primary)' }}>Question #{qIdx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionField(qIdx)}
                        style={{ color: 'var(--clr-high)', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Question Text</label>
                    <textarea
                      className="input-field"
                      style={{ height: 80, padding: 12, resize: 'none' }}
                      placeholder="Enter the question details..."
                      value={q.text}
                      onChange={e => handleQuestionTextChange(qIdx, e.target.value)}
                      required
                    />
                  </div>

                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="input-group">
                      <label className="input-label">Option {String.fromCharCode(65 + optIdx)}</label>
                      <input
                        className="input-field"
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)} text`}
                        value={opt}
                        onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                        required
                      />
                    </div>
                  ))}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="input-group">
                      <label className="input-label">Correct Option</label>
                      <select
                        className="input-field"
                        style={{ padding: '0 12px' }}
                        value={q.correctOption}
                        onChange={e => handleCorrectOptionChange(qIdx, e.target.value)}
                      >
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        <option value={2}>Option C</option>
                        <option value={3}>Option D</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Points</label>
                      <input
                        className="input-field"
                        type="number"
                        min="1"
                        value={q.points}
                        onChange={e => handlePointsChange(qIdx, e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }}>
                Upload &amp; Release Paper
              </button>
            </form>
          </div>
        ) : (
          // Exam List View
          <div className="fade-in">
            <h1 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, marginBottom: 4 }}>Assessments</h1>
            <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)', marginBottom: 20 }}>
              Available papers in exam repository
            </p>

            {/* Search */}
            <div className="input-wrapper" style={{ marginBottom: 20 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, color: 'var(--clr-neutral)' }} />
              <input
                id="exam-search"
                className="input-field"
                style={{ paddingLeft: 40 }}
                type="text"
                placeholder="Search assessments..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            {/* Exam paper list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredExams.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--clr-neutral)' }}>
                  No active assessment papers found.
                </div>
              ) : (
                filteredExams.map(exam => (
                  <div key={exam._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <span className="chip chip-ai" style={{ marginBottom: 6 }}>{exam.subject}</span>
                      <h3 style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 700, marginBottom: 4 }}>{exam.title}</h3>
                      <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-sm)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {exam.duration} Minutes duration · {exam.questions?.length || 0} Questions
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--clr-neutral)' }}>
                        Created by: {exam.createdBy?.name || 'Academic Board'}
                      </span>
                      {!isAdmin && (
                        <button
                          className="btn btn-primary"
                          style={{ height: 34, padding: '0 14px', width: 'auto', fontSize: 12 }}
                          onClick={() => {
                            if (window.confirm(`Start assessment: ${exam.title}?`)) {
                              // We just navigate to verify. Verification screen takes user to exam.
                              navigate('/verify');
                            }
                          }}
                        >
                          Launch Exam →
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Admins to Add Exam */}
      {isAdmin && !isCreating && (
        <button
          id="btn-add-question"
          aria-label="Add new exam paper"
          onClick={() => setIsCreating(true)}
          style={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--clr-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-float)',
            zIndex: 90,
          }}
        >
          <Plus size={24} />
        </button>
      )}

      <BottomNav />
    </div>
  );
}
