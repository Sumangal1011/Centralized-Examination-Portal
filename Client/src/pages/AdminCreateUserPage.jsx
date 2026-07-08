import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, ShieldAlert, ShieldCheck, Image, Eye } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { authAPI } from '../utils/api';

export default function AdminCreateUserPage() {
  const navigate = useNavigate();
  const [uid, setUid] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [photoLink, setPhotoLink] = useState('');
  const [photoPreviewError, setPhotoPreviewError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: success, error

  const handlePhotoLinkChange = (e) => {
    setPhotoLink(e.target.value);
    setPhotoPreviewError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!uid.trim() || !name.trim() || !password.trim()) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }
    if (role === 'student' && photoLink.trim() && photoPreviewError) {
      setMessage({ text: 'The photo URL appears to be invalid or inaccessible. Please check the link.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(uid, name, password, role, role === 'student' ? photoLink : '');
      setMessage({ text: `Account successfully created for ${name} (${uid}) as ${role}!`, type: 'success' });
      // Reset form
      setUid('');
      setName('');
      setPassword('');
      setRole('student');
      setPhotoLink('');
      setPhotoPreviewError(false);
    } catch (err) {
      setMessage({ text: err.message || 'Failed to create user account.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const hasPhotoPreview = role === 'student' && photoLink.trim() && !photoPreviewError;

  return (
    <div className="page-wrapper">
      <TopBar
        title="Admin Controls"
        rightSlot={
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#0f172a)', border: '2px solid var(--clr-border)' }} />
        }
      />

      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--clr-brand)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ fontSize: 'var(--fs-headline-lg)', fontWeight: 700 }}>Register New User</h1>
        </div>

        {message.text && (
          <div style={{
            background: message.type === 'success' ? 'var(--clr-low-bg)' : 'var(--clr-high-bg)',
            color: message.type === 'success' ? 'var(--clr-low)' : 'var(--clr-high)',
            padding: '12px 16px',
            borderRadius: 'var(--r-md)',
            fontSize: 'var(--fs-label-md)',
            marginBottom: 20,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}`
          }}>
            {message.type === 'success' ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ textAlign: 'center', margin: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--clr-ai-blue-bg)', color: 'var(--clr-ai-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={24} />
            </div>
            <p style={{ fontWeight: 600, fontSize: 'var(--fs-headline-md)' }}>User Configuration</p>
            <p style={{ fontSize: 'var(--fs-label-sm)', color: 'var(--clr-neutral)' }}>Create verified university accounts for students or examiners.</p>
          </div>

          <div className="input-group">
            <label className="input-label">University ID / UID</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. S-20600223055 or E-98765432"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. Sumangal Kayal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Initial Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Account Role</label>
            <select
              className="input-field"
              style={{ padding: '0 16px', background: 'var(--clr-surface-low)' }}
              value={role}
              onChange={(e) => { setRole(e.target.value); setPhotoLink(''); setPhotoPreviewError(false); }}
            >
              <option value="student">Student</option>
              <option value="examiner">Examiner (Teacher)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Photo URL field — only for students */}
          {role === 'student' && (
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Image size={14} />
                Student Photo URL <span style={{ color: 'var(--clr-neutral)', fontWeight: 400 }}>(for exam identity verification)</span>
              </label>
              <input
                className="input-field"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={photoLink}
                onChange={handlePhotoLinkChange}
              />
              <p style={{ fontSize: 11, color: 'var(--clr-neutral)', marginTop: 2 }}>
                Paste a direct link to the student's clear face photo. This will be used during exam identity check.
              </p>

              {/* Live photo preview */}
              {photoLink.trim() && (
                <div style={{
                  marginTop: 10,
                  borderRadius: 'var(--r-md)',
                  border: `2px solid ${photoPreviewError ? 'var(--clr-high)' : 'var(--clr-low)'}`,
                  overflow: 'hidden',
                  background: 'var(--clr-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <div style={{
                    padding: '6px 12px',
                    background: photoPreviewError ? 'var(--clr-high-bg)' : 'var(--clr-low-bg)',
                    color: photoPreviewError ? 'var(--clr-high)' : 'var(--clr-low)',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    <Eye size={12} />
                    {photoPreviewError ? '⚠ Could not load photo — check URL' : '✓ Photo Preview'}
                  </div>
                  {!photoPreviewError && (
                    <img
                      src={photoLink}
                      alt="Student photo preview"
                      onError={() => setPhotoPreviewError(true)}
                      style={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register User Account'}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
