import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, BookOpen, ChevronRight, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import TopBar from '../components/TopBar';
import { examAPI, submissionAPI } from '../utils/api';

export default function ExamSelectPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingExamId, setStartingExamId] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examData, subData] = await Promise.all([
          examAPI.list(),
          submissionAPI.getMySubmissions(),
        ]);
        setExams(examData);
        setMySubmissions(subData);
      } catch (err) {
        setError(err.message || 'Failed to load exams.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasSubmitted = (examId) => {
    return mySubmissions.some(sub => {
      const subExamId = sub.exam?._id || sub.exam;
      return subExamId === examId || subExamId?.toString() === examId?.toString();
    });
  };

  const handleStartExam = async (exam) => {
    setStartingExamId(exam._id);
    try {
      // Double-check on server that student hasn't already submitted
      const check = await submissionAPI.checkSubmission(exam._id);
      if (check.submitted) {
        alert('You have already submitted this exam. You cannot take it again.');
        setMySubmissions(prev => {
          // make sure it shows as submitted in UI
          return [...prev, { exam: { _id: exam._id } }];
        });
        setStartingExamId(null);
        return;
      }
      // Save selected exam ID so ExamPage knows which exam to load
      localStorage.setItem('selectedExamId', exam._id);
      navigate('/exam');
    } catch (err) {
      alert('Error: ' + (err.message || 'Could not start exam'));
      setStartingExamId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('verifiedPhoto');
    localStorage.removeItem('selectedExamId');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--clr-low-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={24} color="var(--clr-low)" />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--clr-neutral)' }}>Loading available assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <TopBar
        title="Select Assessment"
        rightSlot={
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-sm)', fontWeight: 600 }}
          >
            <LogOut size={16} />
            Exit
          </button>
        }
      />

      <div className="page-content" style={{ paddingBottom: 40, maxWidth: 600 }}>
        {/* Welcome banner */}
        <div className="card fade-in" style={{
          marginBottom: 28,
          background: 'linear-gradient(135deg, var(--clr-surface-low), var(--clr-surface-high))',
          border: '1px solid var(--clr-border)',
          padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--clr-low-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 22 }}>👋</span>
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--fs-headline-md)', fontWeight: 700, marginBottom: 4 }}>
                Welcome, {user.name || 'Student'}
              </h1>
              <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-sm)' }}>
                ID: {user.uid} • Identity Verified ✓
              </p>
            </div>
          </div>
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <ClipboardList size={20} color="var(--clr-brand)" />
          <h2 style={{ fontSize: 'var(--fs-headline-md)', fontWeight: 700 }}>Available Assessments</h2>
        </div>

        {error && (
          <div style={{
            background: 'var(--clr-high-bg)',
            border: '1px solid rgba(239,68,68,.2)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--clr-high)',
          }}>
            <AlertCircle size={18} />
            <span style={{ fontWeight: 500, fontSize: 'var(--fs-label-md)' }}>{error}</span>
          </div>
        )}

        {exams.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--clr-neutral)' }}>
            <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No Active Assessments</p>
            <p style={{ fontSize: 'var(--fs-label-sm)' }}>There are no exams currently available. Check back later.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {exams.map((exam, idx) => {
              const submitted = hasSubmitted(exam._id);
              const isStarting = startingExamId === exam._id;

              return (
                <div
                  key={exam._id}
                  className="card fade-in"
                  style={{
                    animationDelay: `${idx * 0.07}s`,
                    border: submitted ? '1px solid var(--clr-border)' : '1px solid var(--clr-border)',
                    opacity: submitted ? 0.75 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Exam icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--r-md)',
                      background: submitted ? 'var(--clr-low-bg)' : 'var(--clr-ai-blue-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {submitted
                        ? <CheckCircle size={22} color="var(--clr-low)" />
                        : <BookOpen size={22} color="var(--clr-ai-blue)" />
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Subject chip */}
                      <span className="chip chip-ai" style={{ marginBottom: 8, fontSize: 10 }}>
                        {exam.subject}
                      </span>

                      <h3 style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>
                        {exam.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-sm)' }}>
                          <Clock size={13} />
                          {exam.duration} minutes
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-sm)' }}>
                          <BookOpen size={13} />
                          {exam.questions?.length || 0} questions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    {submitted ? (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        color: 'var(--clr-low)', fontWeight: 700, fontSize: 'var(--fs-label-md)',
                        background: 'var(--clr-low-bg)', padding: '8px 16px',
                        borderRadius: 'var(--r-full)',
                      }}>
                        <CheckCircle size={15} /> Submitted
                      </span>
                    ) : (
                      <button
                        id={`btn-start-exam-${exam._id}`}
                        className="btn btn-primary"
                        style={{ width: 'auto', height: 44, padding: '0 24px', fontSize: 'var(--fs-label-md)', display: 'flex', alignItems: 'center', gap: 8 }}
                        onClick={() => handleStartExam(exam)}
                        disabled={isStarting}
                      >
                        {isStarting ? (
                          <>Starting...</>
                        ) : (
                          <>Start Assessment <ChevronRight size={16} /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info note */}
        <div style={{
          marginTop: 28,
          padding: '14px 16px',
          borderRadius: 'var(--r-md)',
          background: 'var(--clr-ai-blue-bg)',
          border: '1px solid rgba(59,130,246,.2)',
          fontSize: 'var(--fs-label-sm)',
          color: 'var(--clr-ai-blue)',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong>Important:</strong> Once you start an assessment, you must complete it in one session. 
            Switching tabs more than 3 times will automatically cancel your exam. 
            Each assessment can only be taken once.
          </span>
        </div>
      </div>
    </div>
  );
}
