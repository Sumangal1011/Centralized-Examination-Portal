import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Award, BookOpen } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { submissionAPI } from '../utils/api';

export default function ExamReviewPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const review = await submissionAPI.getReview(examId);
        setData(review);
      } catch (err) {
        setError(err.message || 'Failed to load exam review data.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviewData();
  }, [examId]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-neutral)' }}>Loading exam evaluation...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 20 }}>
        <p style={{ fontWeight: 600, color: 'var(--clr-high)', marginBottom: 12 }}>{error || 'No submission data available.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
      </div>
    );
  }

  const { exam, submission } = data;
  const questions = exam.questions || [];
  const studentAnswers = submission.answers || {};

  // Calculate total marks
  const totalPointsAvailable = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return (
    <div className="page-wrapper">
      <TopBar
        title="Exam Review"
        rightSlot={
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#0f172a)', border: '2px solid var(--clr-border)' }} />
        }
      />

      <div className="page-content" style={{ paddingBottom: 110 }}>
        {/* Header Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--clr-brand)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700 }}>Results &amp; Feedback</h1>
            <p style={{ color: 'var(--clr-neutral)', fontSize: 'var(--fs-label-sm)' }}>
              Detailed review of {exam.title}
            </p>
          </div>
        </div>

        {/* Score Card */}
        <div className="card fade-in" style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24, background: 'linear-gradient(135deg, var(--clr-surface-low), var(--clr-surface-high))' }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%', background: 'var(--clr-low-bg)', color: 'var(--clr-low)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Award size={36} />
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700, color: 'var(--clr-low)', marginBottom: 2 }}>
              Score: {submission.score} / {totalPointsAvailable} pts
            </h2>
            <p style={{ fontSize: 'var(--fs-label-md)', color: 'var(--clr-text)' }}>
              Status: <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{submission.status}</span>
            </p>
            <p style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)' }}>
              Completed on: {new Date(submission.submittedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: 'var(--fs-headline-md)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={20} color="var(--clr-brand)" /> Question Performance
          </h3>

          {questions.map((q, idx) => {
            const selectedOpt = studentAnswers[idx.toString()] !== undefined ? studentAnswers[idx.toString()] : studentAnswers[idx];
            const correctOpt = q.correctOption;
            const isCorrect = selectedOpt === correctOpt;

            return (
              <div key={q._id || idx} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14, borderLeft: `4px solid ${isCorrect ? 'var(--clr-low)' : 'var(--clr-high)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontWeight: 700, color: isCorrect ? 'var(--clr-low)' : 'var(--clr-high)' }}>
                    Question {idx + 1} ({isCorrect ? '+' + q.points : '0'} / {q.points} pts)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isCorrect ? (
                      <span className="chip chip-low" style={{ fontSize: 10 }}><CheckCircle size={12} /> Correct</span>
                    ) : (
                      <span className="chip chip-high" style={{ fontSize: 10 }}><XCircle size={12} /> Incorrect</span>
                    )}
                  </div>
                </div>

                <h4 style={{ fontSize: 'var(--fs-body-md)', fontWeight: 600, lineHeight: 1.4 }}>
                  {q.text}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelected = selectedOpt === optIdx;
                    const isCorrectOption = correctOpt === optIdx;

                    let optionBorder = 'var(--clr-border)';
                    let optionBg = 'var(--clr-surface)';
                    let optionColor = 'var(--clr-text)';
                    
                    if (isCorrectOption) {
                      optionBorder = 'var(--clr-low)';
                      optionBg = 'var(--clr-low-bg)';
                      optionColor = 'var(--clr-low)';
                    } else if (isSelected && !isCorrectOption) {
                      optionBorder = 'var(--clr-high)';
                      optionBg = 'var(--clr-high-bg)';
                      optionColor = 'var(--clr-high)';
                    }

                    return (
                      <div
                        key={optIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 'var(--r-md)',
                          border: `1.5px solid ${optionBorder}`,
                          background: optionBg,
                          color: optionColor,
                          fontSize: 'var(--fs-label-md)',
                          fontWeight: (isSelected || isCorrectOption) ? 600 : 400
                        }}
                      >
                        <span style={{
                          width: 24, height: 24, borderRadius: '50%',
                          border: `1.5px solid ${optionBorder}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          {letter}
                        </span>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {isCorrectOption && <span style={{ fontSize: 11, fontWeight: 700 }}>Correct Answer</span>}
                        {isSelected && !isCorrectOption && <span style={{ fontSize: 11, fontWeight: 700 }}>Your Answer</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
