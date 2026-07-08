import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, User, ClipboardList, Award, ExternalLink, Minus } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { submissionAPI } from '../utils/api';

export default function SubmissionsReviewPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await submissionAPI.getExamSubmissions(examId);
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to load exam submissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-neutral)' }}>Loading submissions...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 20 }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-high)', marginBottom: 12 }}>{error || 'No data found.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
      </div>
    );
  }

  const { exam, submissions } = data;
  const questions = exam.questions || [];

  const totalPossible = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

  const selectedSubmission = selectedStudentIdx !== null ? submissions[selectedStudentIdx] : null;

  const getScoreColor = (score) => {
    const pct = totalPossible > 0 ? (score / totalPossible) * 100 : 0;
    if (pct >= 70) return 'var(--clr-low)';
    if (pct >= 40) return 'var(--clr-medium)';
    return 'var(--clr-high)';
  };

  return (
    <div className="page-wrapper">
      <TopBar
        title="Exam Submissions"
        leftSlot={
          <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--clr-primary)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </button>
        }
        rightSlot={
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#0f172a)', border: '2px solid var(--clr-border)' }} />
        }
      />

      <div className="page-content" style={{ paddingBottom: 110 }}>

        {/* Exam header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {selectedSubmission && (
              <button
                onClick={() => setSelectedStudentIdx(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--clr-brand)', fontWeight: 600, fontSize: 'var(--fs-label-md)' }}
              >
                <ArrowLeft size={16} /> Back to list
              </button>
            )}
          </div>
          <span className="chip chip-ai" style={{ marginBottom: 8 }}>{exam.subject}</span>
          <h1 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, marginBottom: 4 }}>{exam.title}</h1>
          <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-md)' }}>
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} • {questions.length} questions • {exam.duration} minutes
          </p>
        </div>

        {/* ─── Student List View ─────────────────────────────── */}
        {selectedStudentIdx === null && (
          <>
            {submissions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--clr-neutral)' }}>
                <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontWeight: 600, marginBottom: 4 }}>No Submissions Yet</p>
                <p style={{ fontSize: 'var(--fs-label-sm)' }}>No students have submitted this exam yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {submissions.map((sub, idx) => {
                  const scoreColor = getScoreColor(sub.score);
                  const scorePct = totalPossible > 0 ? Math.round((sub.score / totalPossible) * 100) : 0;
                  const student = sub.student || {};

                  return (
                    <button
                      key={sub._id}
                      className="card fade-in"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                        textAlign: 'left', cursor: 'pointer', animationDelay: `${idx * 0.05}s`,
                      }}
                      onClick={() => setSelectedStudentIdx(idx)}
                    >
                      {/* Avatar / Photo */}
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--clr-surface)', overflow: 'hidden',
                        border: '2px solid var(--clr-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {(student.photoLink || student.faceImageLink) ? (
                          <img
                            src={student.photoLink || student.faceImageLink}
                            alt={student.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <User size={20} color="var(--clr-neutral)" />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-body-md)', marginBottom: 2 }}>{student.name || 'Unknown'}</div>
                        <div style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-sm)', marginBottom: 6 }}>UID: {student.uid || 'N/A'}</div>
                        {/* Score bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--clr-border)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${scorePct}%`, height: '100%', background: scoreColor, borderRadius: 99 }} />
                          </div>
                          <span style={{ fontWeight: 700, color: scoreColor, fontSize: 'var(--fs-label-sm)', whiteSpace: 'nowrap' }}>
                            {sub.score}/{totalPossible} pts
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span className={`chip ${sub.status === 'submitted' ? 'chip-low' : sub.status === 'cancelled' ? 'chip-high' : 'chip-medium'}`} style={{ fontSize: 10 }}>
                          {sub.status}
                        </span>
                        <ExternalLink size={16} color="var(--clr-neutral)" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── Individual Student Answer View ────────────────── */}
        {selectedSubmission && (
          <>
            {/* Student info card */}
            <div className="card fade-in" style={{
              marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'linear-gradient(135deg, var(--clr-surface-low), var(--clr-surface-high))',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'var(--clr-surface)', overflow: 'hidden',
                border: '2px solid var(--clr-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {(selectedSubmission.student?.photoLink || selectedSubmission.student?.faceImageLink) ? (
                  <img
                    src={selectedSubmission.student.photoLink || selectedSubmission.student.faceImageLink}
                    alt={selectedSubmission.student?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <User size={28} color="var(--clr-neutral)" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontWeight: 700, fontSize: 'var(--fs-body-lg)', marginBottom: 2 }}>
                  {selectedSubmission.student?.name || 'Unknown Student'}
                </h2>
                <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-sm)' }}>
                  UID: {selectedSubmission.student?.uid || 'N/A'} • Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 28, color: getScoreColor(selectedSubmission.score), lineHeight: 1 }}>
                  {selectedSubmission.score}
                </div>
                <div style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)' }}>/ {totalPossible} pts</div>
              </div>
            </div>

            {/* Score summary */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Score', value: `${selectedSubmission.score}/${totalPossible}`, color: getScoreColor(selectedSubmission.score), icon: Award },
                {
                  label: 'Correct',
                  value: questions.filter((q, i) => {
                    const a = selectedSubmission.answers?.[i.toString()] ?? selectedSubmission.answers?.[i];
                    return a !== undefined && Number(a) === q.correctOption;
                  }).length,
                  color: 'var(--clr-low)',
                  icon: CheckCircle,
                },
                {
                  label: 'Incorrect',
                  value: questions.filter((q, i) => {
                    const a = selectedSubmission.answers?.[i.toString()] ?? selectedSubmission.answers?.[i];
                    return a === undefined || Number(a) !== q.correctOption;
                  }).length,
                  color: 'var(--clr-high)',
                  icon: XCircle,
                },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="card" style={{ flex: 1, textAlign: 'center', padding: '14px 8px' }}>
                  <Icon size={18} color={color} style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontWeight: 800, fontSize: 22, color }}>{value}</div>
                  <div style={{ fontSize: 10, color: 'var(--clr-neutral)', fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Questions with answers */}
            <h3 style={{ fontSize: 'var(--fs-headline-md)', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList size={18} color="var(--clr-brand)" /> Answer Sheet
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questions.map((q, idx) => {
                const studentAnswer = selectedSubmission.answers?.[idx.toString()] ?? selectedSubmission.answers?.[idx];
                const selectedOpt = studentAnswer !== undefined ? Number(studentAnswer) : null;
                const isCorrect = selectedOpt !== null && selectedOpt === q.correctOption;
                const isUnanswered = selectedOpt === null;

                return (
                  <div
                    key={q._id || idx}
                    className="card fade-in"
                    style={{
                      borderLeft: `4px solid ${isUnanswered ? 'var(--clr-neutral)' : isCorrect ? 'var(--clr-low)' : 'var(--clr-high)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--fs-label-md)', color: isUnanswered ? 'var(--clr-neutral)' : isCorrect ? 'var(--clr-low)' : 'var(--clr-high)' }}>
                        Q{idx + 1} · {isUnanswered ? '0' : isCorrect ? `+${Number(q.marks) || 1}` : '0'} / {Number(q.marks) || 1} pts
                      </span>
                      {isUnanswered
                        ? <span className="chip chip-medium" style={{ fontSize: 10 }}><Minus size={10} /> Skipped</span>
                        : isCorrect
                          ? <span className="chip chip-low" style={{ fontSize: 10 }}><CheckCircle size={10} /> Correct</span>
                          : <span className="chip chip-high" style={{ fontSize: 10 }}><XCircle size={10} /> Wrong</span>
                      }
                    </div>

                    <p style={{ fontWeight: 600, fontSize: 'var(--fs-body-md)', lineHeight: 1.5, marginBottom: 12 }}>{q.text}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isStudentChoice = selectedOpt === optIdx;
                        const isCorrectOpt = q.correctOption === optIdx;

                        let border = 'var(--clr-border)';
                        let bg = 'var(--clr-surface)';
                        let color = 'var(--clr-text)';

                        if (isCorrectOpt) { border = 'var(--clr-low)'; bg = 'var(--clr-low-bg)'; color = 'var(--clr-low)'; }
                        else if (isStudentChoice && !isCorrectOpt) { border = 'var(--clr-high)'; bg = 'var(--clr-high-bg)'; color = 'var(--clr-high)'; }

                        return (
                          <div key={optIdx} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px',
                            borderRadius: 'var(--r-md)',
                            border: `1.5px solid ${border}`,
                            background: bg, color,
                            fontSize: 'var(--fs-label-md)',
                            fontWeight: (isStudentChoice || isCorrectOpt) ? 600 : 400,
                          }}>
                            <span style={{ width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700 }}>
                              {letter}
                            </span>
                            <span style={{ flex: 1 }}>{opt}</span>
                            {isCorrectOpt && <span style={{ fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>✓ Correct</span>}
                            {isStudentChoice && !isCorrectOpt && <span style={{ fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>✗ Student</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
