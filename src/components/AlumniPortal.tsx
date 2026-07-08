import { useState, useRef, useEffect } from 'react';
import signinImg from '../assets/signin.png';
import uploadIcon from '../assets/image.png';
import ksbLogo from '../assets/ksb.png';
import { API_BASE_URL, getImageUrl } from '../config';

type AuthStep = 'login' | 'register' | 'dashboard' | 'profile' | 'success';

interface ProfileData {
  id?: string;
  name: string;
  studentNumber: string;
  department: string;
  year: string;
  quote: string;
  bio: string;
  email: string;
  linkedin: string;
  photoUrl: string | null;
  photoPreview: string | null;
}

const departments = [
  'Supply Chain And Information System',
];
const gradYears = ['2022', '2023', '2024', '2025', '2026'];

function getDayGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTodayString() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function AlumniPortal() {
  const [step, setStep] = useState<AuthStep>('login');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [registerStudentNumber, setRegisterStudentNumber] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Claiming verification states
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [verifiedDept, setVerifiedDept] = useState('');
  const [verifiedYear, setVerifiedYear] = useState('2026');

  const [profile, setProfile] = useState<ProfileData>({
    name: '', studentNumber: '', department: '', year: '2026', quote: '',
    bio: '', email: '', linkedin: '', photoUrl: null, photoPreview: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const userData = await res.json();
          setProfile({
            id: userData._id || userData.id,
            name: userData.name || '',
            studentNumber: userData.studentNumber || '',
            department: userData.department || '',
            year: userData.year || '2026',
            quote: userData.quote || '',
            bio: userData.bio || '',
            email: userData.email || '',
            linkedin: userData.linkedin || '',
            photoUrl: userData.photoUrl || null,
            photoPreview: userData.photoUrl ? getImageUrl(userData.photoUrl) : null,
          });
          setStep('dashboard');
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Session verification error:', err);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) { setLoginError('Please fill in all fields.'); return; }
    
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      setProfile({
        id: data.user.id,
        name: data.user.name,
        studentNumber: data.user.studentNumber,
        department: data.user.department,
        year: data.user.year,
        quote: data.user.quote || '',
        bio: data.user.bio || '',
        email: data.user.email,
        linkedin: data.user.linkedin || '',
        photoUrl: data.user.photoUrl || null,
        photoPreview: data.user.photoUrl ? getImageUrl(data.user.photoUrl) : null,
      });
      setStep('dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Something went wrong.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!registerStudentNumber.trim() || !registerEmail.trim()) {
      setRegisterError('Please enter both student number and email.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNumber: registerStudentNumber })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      setVerifiedName(data.name);
      setVerifiedDept(data.department);
      setVerifiedYear(data.year);
      setIsVerified(true);
    } catch (err: any) {
      setRegisterError(err.message || 'Verification failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleClaimAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!registerPassword.trim() || !verifiedName.trim() || !verifiedDept || !verifiedYear) {
      setRegisterError('Please fill in all required fields.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/claim-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentNumber: registerStudentNumber,
          email: registerEmail,
          password: registerPassword,
          name: verifiedName,
          department: verifiedDept,
          year: verifiedYear
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Claiming account failed.');

      localStorage.setItem('token', data.token);
      setProfile({
        id: data.user.id,
        name: data.user.name,
        studentNumber: data.user.studentNumber,
        department: data.user.department,
        year: data.user.year,
        quote: '',
        bio: '',
        email: data.user.email,
        linkedin: '',
        photoUrl: null,
        photoPreview: null,
      });

      setIsVerified(false);
      setStep('dashboard');
    } catch (err: any) {
      setRegisterError(err.message || 'Failed to claim account.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    const reader = new FileReader();
    reader.onload = (ev) => setProfile((p) => ({ ...p, photoPreview: ev.target?.result as string }));
    reader.readAsDataURL(file);

    const token = localStorage.getItem('token');
    if (!token) return;

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/alumni/upload-photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Photo upload failed');

      setProfile(p => ({
        ...p,
        photoUrl: data.photoUrl,
        photoPreview: getImageUrl(data.photoUrl)
      }));
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to upload photo.');
      setProfile(p => ({ ...p, photoPreview: null }));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPhotoError('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/alumni/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profile.name,
          department: profile.department,
          year: profile.year,
          quote: profile.quote,
          bio: profile.bio,
          linkedin: profile.linkedin,
          photoUrl: profile.photoUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save profile');

      setProfile(p => ({
        ...p,
        name: data.name,
        department: data.department,
        year: data.year,
        quote: data.quote || '',
        bio: data.bio || '',
        linkedin: data.linkedin || '',
        photoUrl: data.photoUrl,
        photoPreview: data.photoUrl ? getImageUrl(data.photoUrl) : null,
      }));

      if (e) setStep('success');
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (step === 'dashboard') {
      const timer = setTimeout(() => {
        handleSaveProfile();
      }, 1500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.name, profile.department, profile.year, profile.quote, profile.bio, profile.linkedin, profile.photoUrl, step]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setStep('login');
    setShowUserDropdown(false);
    setLoginEmail('');
    setLoginPassword('');
    setRegisterStudentNumber('');
    setRegisterEmail('');
    setRegisterPassword('');
    setIsVerified(false);
    setProfile({
      name: '', studentNumber: '', department: '', year: '2026', quote: '',
      bio: '', email: '', linkedin: '', photoUrl: null, photoPreview: null,
    });
  };

  const renderNavRight = (nameForAvatar: string) => {
    return (
      <div className="ap-dash-nav-right" style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          {profile.photoPreview
            ? <img src={profile.photoPreview} className="ap-dash-avatar-img" alt="You" />
            : <div className="ap-dash-avatar">{nameForAvatar[0]?.toUpperCase() || 'A'}</div>}
        </button>

        {showUserDropdown && (
          <>
            <div className="ap-dropdown-backdrop" onClick={() => setShowUserDropdown(false)} />
            <div className="ap-user-dropdown">
              <div className="ap-user-dropdown-info">
                <p className="ap-dropdown-name">{nameForAvatar}</p>
                <p className="ap-dropdown-email">{profile.email || loginEmail || 'alumnus@yearbook.com'}</p>
              </div>
              <button
                type="button"
                className="ap-dropdown-item ap-dropdown-item--logout"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    );
  };
  const renderLogo = () => {
    return (
      <div className="ap-dash-nav-logo" onClick={() => window.location.hash = ''} style={{ cursor: 'pointer' }}>
        <img src={ksbLogo} alt="YearBook Logo" className="ap-dash-logo-img" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        <span>YearBook</span>
      </div>
    );
  };
  const profileComplete = !!(profile.name && profile.studentNumber && profile.department && profile.photoUrl);

  if (step === 'login') {
    return (
      <div className="ap-login-root">
        <div className="ap-login-image-panel">
          <img src={signinImg} alt="YearBook alumni" className="ap-login-image" />
          <div className="ap-login-image-overlay" />
          <div className="ap-login-quote">
            <p className="ap-login-quote-text">
              "Relive the moments that shaped us,<br />
              and connect with the people who made it unforgettable."
            </p>
            <span className="ap-login-quote-author">— YearBook, SCIS Department</span>
          </div>
        </div>

        <div className="ap-login-form-panel">
          <div className="ap-login-topbar">
            <button type="button" className="ap-login-back-link" onClick={() => window.location.hash = ''}>
              ← Back to Yearbook
            </button>
          </div>
          <div className="ap-login-form-center">
            <h1 className="ap-login-title">Log in</h1>
            <p className="ap-login-sub">Welcome back, Alumnus.</p>
            <form id="alumni-login-form" className="ap-login-form" onSubmit={handleLogin}>
              <div className="ap-field">
                <label htmlFor="alumni-email" className="ap-label">EMAIL ADDRESS</label>
                <input id="alumni-email" type="email" className="ap-input" placeholder="you@example.com"
                  value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="ap-field">
                <label htmlFor="alumni-password" className="ap-label">PASSWORD</label>
                <input id="alumni-password" type="password" className="ap-input" placeholder="••••••••"
                  value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoComplete="current-password" />
              </div>
              {loginError && <p className="ap-error" role="alert">{loginError}</p>}
              <button id="alumni-login-btn" type="submit"
                className={`ap-submit-btn${isLoggingIn ? ' ap-submit-btn--loading' : ''}`} disabled={isLoggingIn}>
                {isLoggingIn ? <span className="ap-spinner" aria-label="Signing in…" /> : 'Log in'}
              </button>
              <p className="ap-form-note">
                New here?{' '}
                <button id="alumni-request-access-btn" type="button" className="ap-link" onClick={() => setStep('register')}>Create an account</button>
              </p>
            </form>
          </div>
          <div className="ap-login-footer">© 2026 YearBook. All rights reserved.</div>
        </div>
      </div>
    );
  }

  if (step === 'register') {
    return (
      <div className="ap-login-root">
        <div className="ap-login-image-panel">
          <img src={signinImg} alt="YearBook alumni" className="ap-login-image" />
          <div className="ap-login-image-overlay" />
          <div className="ap-login-quote">
            <p className="ap-login-quote-text">
              "Join the graduates network.<br />
              Secure your place in the Yearbook."
            </p>
            <span className="ap-login-quote-author">— YearBook, KSB Portal</span>
          </div>
        </div>

        <div className="ap-login-form-panel" style={{ overflowY: 'auto' }}>
          <div className="ap-login-topbar">
            <button type="button" className="ap-login-back-link" onClick={() => { setIsVerified(false); setStep('login'); }}>
              ← Back to login
            </button>
          </div>
          <div className="ap-login-form-center" style={{ margin: '40px auto 60px auto', paddingBottom: '40px', overflow: 'visible', flexShrink: 0 }}>
            <h1 className="ap-login-title">Claim Account</h1>
            
            {!isVerified ? (
              // Step 1: Verify Student Number & Email
              <>
                <p className="ap-login-sub">Enter your student number and email to retrieve your profile.</p>
                <form id="alumni-verify-form" className="ap-login-form" onSubmit={handleVerifyStudent}>
                  <div className="ap-field">
                    <label htmlFor="reg-student-number" className="ap-label">Student Number</label>
                    <input id="reg-student-number" type="text" className="ap-input" placeholder="e.g. 20221001"
                      value={registerStudentNumber} onChange={(e) => setRegisterStudentNumber(e.target.value)} required />
                  </div>
                  <div className="ap-field">
                    <label htmlFor="reg-email" className="ap-label">Email Address</label>
                    <input id="reg-email" type="email" className="ap-input" placeholder="you@example.com"
                      value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                  </div>
                  {registerError && <p className="ap-error" role="alert">{registerError}</p>}
                  <button id="alumni-verify-btn" type="submit"
                    className={`ap-submit-btn${isRegistering ? ' ap-submit-btn--loading' : ''}`} disabled={isRegistering}>
                    {isRegistering ? <span className="ap-spinner" aria-label="Verifying status…" /> : 'Find My Details →'}
                  </button>
                </form>
              </>
            ) : (
              // Step 2: Confirm pre-filled details & Choose Password
              <>
                <p className="ap-login-sub">Verify your details and choose a password to complete your account.</p>
                <form id="alumni-claim-form" className="ap-login-form" onSubmit={handleClaimAccount}>
                  
                  {/* Readonly info card */}
                  <div className="ap-success-card" style={{ padding: '12px', marginBottom: '18px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>VERIFIED STUDENT</p>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 600, color: '#f8fafc' }}>ID: {registerStudentNumber}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#3b82f6' }}>{registerEmail}</p>
                  </div>

                  <div className="ap-field">
                    <label htmlFor="claim-name" className="ap-label">Full Name</label>
                    <input id="claim-name" type="text" className="ap-input"
                      value={verifiedName} onChange={(e) => setVerifiedName(e.target.value)} required />
                  </div>

                  <div className="ap-field">
                    <label htmlFor="claim-dept" className="ap-label">Department / Course</label>
                    <select id="claim-dept" className="ap-input ap-pf-select" value={verifiedDept}
                      onChange={(e) => setVerifiedDept(e.target.value)} required>
                      {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="ap-field">
                    <label htmlFor="claim-year" className="ap-label">Graduation Year</label>
                    <select id="claim-year" className="ap-input ap-pf-select" value={verifiedYear}
                      onChange={(e) => setVerifiedYear(e.target.value)} required>
                      {gradYears.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>

                  <div className="ap-field">
                    <label htmlFor="claim-password" className="ap-label">Create Password</label>
                    <input id="claim-password" type="password" className="ap-input" placeholder="Choose a secure password"
                      value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
                  </div>

                  {registerError && <p className="ap-error" role="alert">{registerError}</p>}
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="ap-submit-btn" style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8', flex: 1 }}
                      onClick={() => setIsVerified(false)}>
                      ← Back
                    </button>
                    <button id="alumni-claim-submit-btn" type="submit"
                      className={`ap-submit-btn${isRegistering ? ' ap-submit-btn--loading' : ''}`} style={{ flex: 2 }} disabled={isRegistering}>
                      {isRegistering ? <span className="ap-spinner" aria-label="Activating account…" /> : 'Claim Account ✓'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
          <div className="ap-login-footer">© 2026 YearBook. All rights reserved.</div>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="ap-dash-root">
        <nav className="ap-dash-nav">
          <div className="ap-dash-nav-left">{renderLogo()}</div>
          {renderNavRight(profile.name || 'Alumnus')}
        </nav>

        <div className="ap-profile-shell">
          <div className="ap-profile-wrap">
            <h2 className="ap-profile-title">Complete your profile</h2>
            <p className="ap-profile-sub">Your details will appear in the yearbook under your year.</p>

            <form className="ap-profile-form" onSubmit={handleSaveProfile} id="alumni-profile-form">
              <div className="ap-photo-row">
                <button type="button" id="alumni-photo-upload-btn"
                  className={`ap-photo-btn${profile.photoPreview ? ' has-photo' : ''}${isUploadingPhoto ? ' ap-photo-btn--loading' : ''}`}
                  onClick={() => fileInputRef.current?.click()} disabled={isUploadingPhoto}>
                  {profile.photoPreview
                    ? <img src={profile.photoPreview} alt="Portrait" className="ap-photo-img" />
                    : <div className="ap-photo-empty"><img src={uploadIcon} className="ap-photo-upload-icon-img" alt="Upload" /><span>Upload Portrait</span><span className="ap-photo-hint">JPG, PNG · Max 5MB</span></div>}
                  <div className="ap-photo-hover">{isUploadingPhoto ? 'Uploading...' : 'Change Photo'}</div>
                </button>
                <input ref={fileInputRef} id="alumni-photo-file-input" type="file" accept="image/*"
                  style={{ display: 'none' }} onChange={handlePhotoChange} />
                <div className="ap-photo-info">
                  <p>Your portrait will appear in the <strong>Graduates</strong> section.</p>
                  <p>Use a clear, front-facing headshot with good lighting.</p>
                  {photoError && <p className="ap-error" style={{ margin: '8px 0 0 0' }}>{photoError}</p>}
                </div>
              </div>

              <div className="ap-pf-grid">
                <div className="ap-pf-field">
                  <label htmlFor="alumni-name" className="ap-pf-label">Full Name</label>
                  <input id="alumni-name" type="text" className="ap-pf-input" placeholder="e.g. Marcus Johnson"
                    value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="ap-pf-field">
                  <label htmlFor="alumni-student-number" className="ap-pf-label">Student Number</label>
                  <input id="alumni-student-number" type="text" className="ap-pf-input" placeholder="e.g. 20268541"
                    value={profile.studentNumber} disabled style={{ backgroundColor: '#1e293b', cursor: 'not-allowed' }} />
                </div>
                <div className="ap-pf-field">
                  <label htmlFor="alumni-department" className="ap-pf-label">Department</label>
                  <select id="alumni-department" className="ap-pf-input ap-pf-select" value={profile.department}
                    onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))} required>
                    <option value="" disabled>Select department</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="ap-pf-field">
                  <label htmlFor="alumni-year" className="ap-pf-label">Graduation Year</label>
                  <select id="alumni-year" className="ap-pf-input ap-pf-select" value={profile.year}
                    onChange={(e) => setProfile((p) => ({ ...p, year: e.target.value }))}>
                    {gradYears.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="ap-pf-field" style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="alumni-linkedin" className="ap-pf-label">LinkedIn <span style={{ fontWeight: 500, color: '#94a3b8' }}>(optional)</span></label>
                  <input id="alumni-linkedin" type="url" className="ap-pf-input" placeholder="https://linkedin.com/in/..."
                    value={profile.linkedin} onChange={(e) => setProfile((p) => ({ ...p, linkedin: e.target.value }))} />
                </div>
              </div>

              <div className="ap-pf-field" style={{ marginTop: 0 }}>
                <label htmlFor="alumni-quote" className="ap-pf-label">Yearbook Quote <span style={{ fontWeight: 500, color: '#94a3b8', textTransform: 'none', fontSize: '11px' }}>— appears under your photo</span></label>
                <input id="alumni-quote" type="text" className="ap-pf-input" placeholder='"The journey was worth every moment."'
                  value={profile.quote} maxLength={120} onChange={(e) => setProfile((p) => ({ ...p, quote: e.target.value }))} />
                <span className="ap-pf-count">{profile.quote.length} / 120</span>
              </div>

              <div className="ap-pf-field">
                <label htmlFor="alumni-bio" className="ap-pf-label">Short Bio <span style={{ fontWeight: 500, color: '#94a3b8', textTransform: 'none', fontSize: '11px' }}>— what are you up to now?</span></label>
                <textarea id="alumni-bio" className="ap-pf-input ap-pf-textarea" rows={3}
                  placeholder="e.g. Working as a software engineer at Acme Corp…"
                  value={profile.bio} maxLength={300} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} />
                <span className="ap-pf-count">{profile.bio.length} / 300</span>
              </div>

              <div className="ap-pf-actions">
                <button type="button" className="ap-pf-btn-ghost" onClick={() => setStep('dashboard')}>Cancel</button>
                <button type="submit" id="alumni-submit-btn"
                  className={`ap-pf-btn-primary${isSubmitting ? ' loading' : ''}`} disabled={isSubmitting}>
                  {isSubmitting ? <span className="ap-spinner" /> : 'Save Profile ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="ap-dash-root">
        <nav className="ap-dash-nav">
          <div className="ap-dash-nav-left">{renderLogo()}</div>
          {renderNavRight(profile.name || 'Alumnus')}
        </nav>
        <div className="ap-success-shell">
          <div className="ap-success-wrap">
            <div className="ap-success-glyph">🎓</div>
            <h2>You're in the book!</h2>
            <p>Your profile has been saved. Your entry will appear in the yearbook under your department.</p>
            {profile.photoPreview && (
              <div className="ap-success-card">
                <div className="ap-success-frame"><img src={profile.photoPreview} alt="Portrait" /></div>
                <p className="ap-success-name">{profile.name}</p>
                <p className="ap-success-dept">{profile.department} · Class of {profile.year}</p>
                {profile.quote && <p className="ap-success-quote">"{profile.quote}"</p>}
              </div>
            )}
            <div className="ap-success-btns">
              <button className="ap-pf-btn-ghost" onClick={() => setStep('profile')}>Edit Profile</button>
              <button className="ap-pf-btn-primary" onClick={() => setStep('dashboard')}>Go to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.name || verifiedName || loginEmail.split('@')[0] || 'Alumnus';

  return (
    <div className="ap-dash-root">
      <nav className="ap-dash-nav">
        <div className="ap-dash-nav-left">{renderLogo()}</div>
        {renderNavRight(displayName)}
      </nav>

      <main className="ap-dash-main">
        <div className="ap-dash-hero">
          <div className="ap-dash-hero-dots" aria-hidden="true" />
          <div className="ap-dash-hero-left">
            <h1 className="ap-dash-hero-greeting">
              {getDayGreeting()},<br />
              <span>{displayName}!</span>
            </h1>
            <p className="ap-dash-hero-date">
              {profileComplete ? 'Your profile is complete ✓' : 'Complete your profile in the menu below.'}&ensp;·&ensp;{getTodayString()}
            </p>
          </div>

          {/* <div className="ap-dash-hero-card">
            {profileComplete ? (
              <>
                <div className="ap-hero-card-icon ap-hero-card-icon--check">✓</div>
                <p className="ap-hero-card-title">Profile complete!</p>
                <p className="ap-hero-card-sub">You're all set — your entry will appear in the yearbook.</p>
                <button className="ap-hero-card-btn" onClick={() => setStep('profile')}>✏ Edit Profile</button>
              </>
            ) : (
              <>
                <div className="ap-hero-card-spinner" aria-hidden="true" />
                <p className="ap-hero-card-title">Complete your profile</p>
                <p className="ap-hero-card-sub">Add your photo and details to appear in the yearbook.</p>
                <button id="ap-hero-complete-btn" className="ap-hero-card-btn" onClick={() => setStep('profile')}>
                  📝 Get started
                </button>
              </>
            )}
          </div> */}
        </div>

        <div className="ap-dash-grid">
          <div className="ap-dash-card ap-grid-card--portrait"
            onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
            style={{ cursor: isUploadingPhoto ? 'not-allowed' : 'pointer', alignItems: 'center', justifyContent: 'center' }}>
            <input ref={fileInputRef} id="ap-grid-photo-input" type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handlePhotoChange} onClick={(e) => e.stopPropagation()} />
            {profile.photoPreview ? (
              <>
                <div className="ap-grid-portrait-frame">
                  <img src={profile.photoPreview} alt="Your portrait" className="ap-grid-portrait-img" />
                  <div className="ap-grid-portrait-overlay">
                    <img src={uploadIcon} className="ap-photo-upload-icon-img" style={{ filter: 'invert(1)' }} alt="Upload" />
                    <span>{isUploadingPhoto ? 'Uploading...' : 'Change photo'}</span>
                  </div>
                </div>
                <span className="ap-card-badge ap-card-badge--green" style={{ marginTop: 10, marginBottom: 0 }}>
                  {isUploadingPhoto ? 'Uploading image...' : 'Portrait uploaded ✓'}
                </span>
              </>
            ) : (
              <div className="ap-grid-portrait-empty">
                <div className="ap-grid-portrait-circle">
                  <img src={uploadIcon} className="ap-photo-upload-icon-img" alt="Upload" />
                </div>
                <p className="ap-grid-portrait-label">{isUploadingPhoto ? 'Uploading...' : 'Upload Your Portrait'}</p>
                <p className="ap-grid-portrait-hint">Click to choose a photo · JPG or PNG</p>
                <span className="ap-card-badge ap-card-badge--amber" style={{ marginBottom: 0 }}>PENDING</span>
              </div>
            )}
            {photoError && <p className="ap-error" style={{ marginTop: 6, fontSize: '12px' }}>{photoError}</p>}
          </div>

          <div className="ap-dash-card ap-grid-card--quote-entry" onClick={(e) => e.stopPropagation()}>
            <div className="ap-grid-quote-top">
              <span className="ap-grid-bigquote">"</span>
              <div className="ap-card-badge" style={{ marginBottom: 0 }}>✏️ YOUR QUOTE</div>
            </div>
            <textarea
              id="ap-grid-quote-input"
              className="ap-grid-quote-textarea"
              placeholder="Write something that defines your journey…"
              value={profile.quote}
              maxLength={120}
              onChange={(e) => setProfile((p) => ({ ...p, quote: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="ap-grid-quote-footer">
              <span className="ap-pf-count">{profile.quote.length} / 120</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                {isSubmitting ? 'Saving...' : 'Auto-saved'}
              </span>
            </div>
          </div>

          <div className="ap-dash-card ap-grid-card--profile-details" onClick={(e) => e.stopPropagation()} style={{ gridColumn: 'span 2' }}>
            <div className="ap-card-badge" style={{ marginBottom: 12 }}>👤 YOUR PROFILE</div>
            <div className="ap-grid-profile-fields">
              <div className="ap-grid-pf-row">
                <label htmlFor="ap-grid-name" className="ap-grid-pf-label">Full Name</label>
                <input id="ap-grid-name" type="text" className="ap-grid-pf-input"
                  placeholder="e.g. Marcus Johnson"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="ap-grid-pf-row">
                <label htmlFor="ap-grid-student-number" className="ap-grid-pf-label">Student Number</label>
                <input id="ap-grid-student-number" type="text" className="ap-grid-pf-input"
                  value={profile.studentNumber} disabled style={{ backgroundColor: '#1e293b', cursor: 'not-allowed', color: '#94a3b8' }} />
              </div>
              <div className="ap-grid-pf-row">
                <label htmlFor="ap-grid-dept" className="ap-grid-pf-label">Department / Course</label>
                <select id="ap-grid-dept" className="ap-grid-pf-input ap-grid-pf-select"
                  value={profile.department}
                  onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}>
                  <option value="" disabled>Select department</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="ap-grid-pf-row">
                <label htmlFor="ap-grid-year" className="ap-grid-pf-label">Graduation Year</label>
                <select id="ap-grid-year" className="ap-grid-pf-input ap-grid-pf-select"
                  value={profile.year}
                  onChange={(e) => setProfile((p) => ({ ...p, year: e.target.value }))}>
                  {gradYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {isSubmitting ? 'Syncing...' : 'Changes are auto-saved to the cloud.'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
