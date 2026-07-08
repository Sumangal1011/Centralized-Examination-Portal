import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, ChevronLeft, AlertTriangle } from 'lucide-react';
import { examAPI, submissionAPI, incidentAPI } from '../utils/api';

export default function ExamPage() {
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showMonitor, setShowMonitor] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [warningsCount, setWarningsCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [verifiedPhoto, setVerifiedPhoto] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    const photo = localStorage.getItem('verifiedPhoto');
    if (photo) setVerifiedPhoto(photo);
  }, []);

  const questions = exam ? exam.questions : [];
  const q = questions[qIndex];
  const progress = questions.length > 0 ? Math.round(((qIndex + 1) / questions.length) * 100) : 0;

  const handleSubmitExam = useCallback(async (currentSelected = selected, currentExam = exam) => {
    if (!currentExam) return;
    setSubmitting(true);
    try {
      await submissionAPI.submit(currentExam._id, currentSelected);
      try {
        await incidentAPI.report({
          examId: currentExam._id,
          eventLabel: 'Exam Completed',
          eventSub: 'Candidate finished and submitted the assessment.',
          eventType: 'submit',
        });
      } catch (e) { /* ignore log error */ }
      // Clear selectedExamId after submission
      localStorage.removeItem('selectedExamId');
      navigate('/dashboard');
    } catch (err) {
      alert('Error submitting exam: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }, [exam, selected, navigate]);

  const handleCancelExam = useCallback(async (currentSelected = selected, currentExam = exam) => {
    if (!currentExam) return;
    setSubmitting(true);
    try {
      await submissionAPI.submit(currentExam._id, currentSelected, 'cancelled');
      try {
        await incidentAPI.report({
          examId: currentExam._id,
          riskScore: 100,
          eventLabel: 'Exam Automatically Cancelled',
          eventSub: 'Exam cancelled automatically due to exceeding tab switch limit (4 tab switches detected).',
          eventType: 'tab_switch',
          incidentSnapshot: verifiedPhoto || '',
        });
      } catch (e) { /* ignore log error */ }
      localStorage.removeItem('selectedExamId');
      alert('Your exam has been automatically CANCELLED because you switched tabs more than 3 times!');
      navigate('/dashboard');
    } catch (err) {
      alert('Error submitting cancelled exam: ' + err.message);
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  }, [exam, selected, navigate, verifiedPhoto]);

  // Load the specific exam selected by the student
  useEffect(() => {
    const fetchExam = async () => {
      try {
        // Get the selected exam ID from localStorage (set by ExamSelectPage)
        const selectedExamId = localStorage.getItem('selectedExamId');
        if (!selectedExamId) {
          setError('No exam selected. Please choose an exam from the selection page.');
          setLoading(false);
          return;
        }

        // Check if student already submitted this exam (server-side guard)
        try {
          const check = await submissionAPI.checkSubmission(selectedExamId);
          if (check.submitted) {
            setAlreadySubmitted(true);
            setLoading(false);
            return;
          }
        } catch (checkErr) {
          // If check fails, proceed — submission API will reject duplicate anyway
          console.warn('Could not verify submission status:', checkErr.message);
        }

        const examData = await examAPI.getById(selectedExamId);
        setExam(examData);
        setTimeLeft(examData.duration * 60);

        // Log exam start
        try {
          await incidentAPI.report({
            examId: examData._id,
            eventLabel: 'Exam Started',
            eventSub: 'Candidate entered and initialized exam environment.',
            eventType: 'start',
          });
        } catch (e) {
          console.error('Failed to log exam start event:', e);
        }
      } catch (err) {
        setError(err.message || 'Failed to load exam paper.');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (loading || error || submitting || !exam || alreadySubmitted) return;
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmitExam(selected, exam);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [loading, error, submitting, exam, selected, handleSubmitExam, alreadySubmitted]);

  // Proctoring: tab switch detection
  useEffect(() => {
    if (!exam || submitting || alreadySubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningsCount(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [exam, submitting, alreadySubmitted]);

  // Handle warnings
  useEffect(() => {
    if (warningsCount === 0 || !exam) return;

    if (warningsCount > 3) {
      handleCancelExam(selected, exam);
    } else {
      incidentAPI.report({
        examId: exam._id,
        riskScore: Math.min(100, warningsCount * 25),
        eventLabel: `Tab Switch Warning #${warningsCount}`,
        eventSub: `Candidate switched tab/minimized exam window (Warning ${warningsCount}/3).`,
        eventType: 'tab_switch',
        incidentSnapshot: verifiedPhoto || '',
      }).catch(err => console.error(err));

      setShowWarningModal(true);
    }
  }, [warningsCount, exam, handleCancelExam, selected, verifiedPhoto]);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleBookmark = useCallback(() => {
    setBookmarked(b => ({ ...b, [qIndex]: !b[qIndex] }));
  }, [qIndex]);

  const handleNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1);
    } else {
      if (window.confirm('Are you sure you want to submit your exam?')) {
        handleSubmitExam(selected, exam);
      }
    }
  };

  const handlePrev = () => {
    if (qIndex > 0) setQIndex(i => i - 1);
  };

  const isLow = timeLeft < 300;

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-neutral)' }}>Loading exam paper...</p>
      </div>
    );
  }

  // Already submitted guard
  if (alreadySubmitted) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 24 }}>
        <div style={{
          background: 'var(--clr-high-bg)', border: '1px solid rgba(239,68,68,.2)',
          borderRadius: 'var(--r-lg)', padding: '32px 24px', textAlign: 'center', maxWidth: 400,
        }}>
          <AlertTriangle size={48} color="var(--clr-high)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 'var(--fs-headline-md)', fontWeight: 700, color: 'var(--clr-high)', marginBottom: 8 }}>
            Exam Already Submitted
          </h2>
          <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)', marginBottom: 24, lineHeight: 1.5 }}>
            You have already submitted this exam. Each assessment can only be attempted once.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 20 }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-high)', marginBottom: 12 }}>
          {error || 'No exam found. Please return to the selection page.'}
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/exam-select')}>
          Go to Exam Selection
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: 'var(--clr-surface)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', background: 'var(--clr-white)', borderBottom: '1px solid var(--clr-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-body-lg)' }}>{exam.title}</div>
            <div style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)' }}>{exam.subject}</div>
          </div>
          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: isLow ? 'var(--clr-high-bg)' : 'var(--clr-low-bg)',
            color: isLow ? 'var(--clr-high)' : 'var(--clr-primary)',
            padding: '8px 14px',
            borderRadius: 'var(--r-full)',
            fontWeight: 700,
            fontSize: 'var(--fs-body-md)',
          }}>
            ⏱ {fmt(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-label-sm)', marginBottom: 6 }}>
          <span style={{ fontWeight: 500 }}>Question {qIndex + 1} of {questions.length}</span>
          <span style={{ fontWeight: 700 }}>{progress}% Complete</span>
        </div>
        <div className="progress-track" style={{ marginBottom: 16 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question body */}
      <div style={{ padding: '20px 20px 120px', position: 'relative' }}>
        {q && (
          <>
            {/* Type badge */}
            <div style={{
              display: 'inline-block',
              background: 'var(--clr-surface-low)',
              border: '1px solid var(--clr-border)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 'var(--fs-label-sm)',
              fontWeight: 600,
              letterSpacing: '.06em',
              marginBottom: 16,
              color: 'var(--clr-neutral)',
            }}>
              {q.type} • {q.marks ?? 1} POINTS
            </div>

            <h2 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, lineHeight: 1.4, marginBottom: 24 }}>
              {q.text}
            </h2>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {q.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelectedOpt = selected[qIndex] === i;
                return (
                  <button
                    key={i}
                    id={`option-${letter}`}
                    onClick={() => setSelected(s => ({ ...s, [qIndex]: i }))}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: '16px',
                      borderRadius: 'var(--r-md)',
                      border: `1.5px solid ${isSelectedOpt ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                      background: isSelectedOpt ? 'rgba(16,185,129,0.05)' : 'var(--clr-white)',
                      textAlign: 'left',
                      transition: 'border-color .18s, background .18s',
                      cursor: 'pointer',
                      boxShadow: isSelectedOpt ? 'var(--shadow-card)' : 'none',
                    }}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: `1.5px solid ${isSelectedOpt ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                      background: isSelectedOpt ? 'var(--clr-primary)' : 'var(--clr-white)',
                      color: isSelectedOpt ? 'var(--clr-white)' : 'var(--clr-neutral)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      fontWeight: 700,
                      fontSize: 'var(--fs-label-md)',
                      transition: 'all .18s',
                    }}>
                      {letter}
                    </span>
                    <span style={{ fontSize: 'var(--fs-body-md)', lineHeight: 1.6, paddingTop: 4, color: 'var(--clr-text)' }}>{opt}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Live monitoring PiP */}
        {showMonitor && (
          <div style={{
            position: 'fixed',
            bottom: 110,
            right: 16,
            width: 130,
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-float)',
            border: '1px solid var(--clr-border)',
            zIndex: 60,
          }}>
            <div style={{ background: 'var(--clr-primary)', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ color: 'white', fontSize: 9, fontWeight: 700, letterSpacing: '.05em' }}>LIVE PROCTOR MONITOR</span>
            </div>
            <div style={{
              height: 90,
              background: '#0f172a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {verifiedPhoto ? (
                <img
                  src={verifiedPhoto}
                  alt="Verified Photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: 40, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.15)' }} />
              )}
            </div>
            <div style={{ background: 'var(--clr-primary)', padding: '4px 8px', textAlign: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 9 }}>Status: Secure</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'var(--clr-white)',
        borderTop: '1px solid var(--clr-border)',
        padding: '12px 20px',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}>
        <button
          id="btn-prev"
          onClick={handlePrev}
          disabled={qIndex === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: qIndex === 0 ? 'var(--clr-neutral-light)' : 'var(--clr-primary)',
            fontSize: 'var(--fs-label-md)', fontWeight: 600,
            background: 'none', border: 'none',
          }}
        >
          <ChevronLeft size={18} /> Previous
        </button>

        <button
          id="btn-bookmark"
          onClick={toggleBookmark}
          style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            border: '1px solid var(--clr-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: bookmarked[qIndex] ? 'var(--clr-primary)' : 'var(--clr-neutral)',
            background: bookmarked[qIndex] ? 'var(--clr-input-bg)' : 'var(--clr-white)',
            flexShrink: 0,
          }}
          aria-label="Bookmark question"
        >
          <Bookmark size={18} fill={bookmarked[qIndex] ? 'currentColor' : 'none'} />
        </button>

        <button
          id="btn-save-next"
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={handleNext}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : qIndex < questions.length - 1 ? 'Save & Next →' : 'Submit Exam →'}
        </button>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999, padding: '20px',
        }}>
          <div style={{
            background: 'var(--clr-white)',
            borderRadius: 'var(--r-lg)',
            padding: '30px 24px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-float)',
            border: '2px solid var(--clr-high)',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              backgroundColor: 'var(--clr-high-bg)', color: 'var(--clr-high)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', margin: '0 auto 16px',
            }}>
              ⚠️
            </div>
            <h3 style={{ fontSize: 'var(--fs-headline-md)', fontWeight: 700, color: 'var(--clr-high)', marginBottom: 10 }}>
              Tab Switch Detected!
            </h3>
            <p style={{ fontSize: 'var(--fs-body-md)', color: 'var(--clr-neutral)', lineHeight: 1.5, marginBottom: 20 }}>
              Warning <strong>{warningsCount} of 3</strong>.<br />
              Please do not navigate away from this exam screen. Switching tabs more than 3 times will result in <strong>automatic cancellation</strong> of your exam.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', background: 'var(--clr-high)', borderColor: 'var(--clr-high)' }}
              onClick={() => setShowWarningModal(false)}
            >
              I Understand & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
