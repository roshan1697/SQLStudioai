import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth.scss';

function IconDB() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    );
}

function IconUser() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
    );
}

function IconMail() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}

function IconLock() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function IconAlert() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    );
}

function PasswordStrength({ password }:{password:string}) {
    const strength = (() => {
        if (!password) return 0;
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    })();

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#22c55e', '#00d9ff'];

    if (!password) return null;

    return (
        <div className="auth__strength">
            <div className="auth__strength-bars">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className="auth__strength-bar"
                        style={{ background: i <= strength ? colors[strength] : '' }}
                    />
                ))}
            </div>
            <span className="auth__strength-label" style={{ color: colors[strength] }}>
                {labels[strength]}
            </span>
        </div>
    );
}

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password || !form.confirm) {
            setError('Please fill in all fields');
            return;
        }
        if (form.password !== form.confirm) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        await new Promise(r => setTimeout(r, 700));
        try {
            signup(form.name, form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth">
            {/* Left visual panel */}
            <div className="auth__visual">
                <div className="auth__visual-bg" />
                <div className="auth__visual-grid" />
                <div className="auth__visual-content">
                    <p className="auth__visual-label">Join thousands of developers</p>
                    <h2 className="auth__visual-headline">
                        Start writing<br />better SQL<br />today.
                    </h2>
                    <p className="auth__visual-sub">
                        Access 10+ curated SQL challenges with an in-browser Monaco editor. Track your progress and sharpen your query skills.
                    </p>
                    <div className="auth__visual-chips">
                        {['Free forever', 'No credit card', 'Instant access', '10+ problems'].map(t => (
                            <span key={t} className="auth__visual-chip">{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth__panel">
                <div className="auth__inner">
                    <div className="auth__logo">
                        <div className="auth__logo-icon"><IconDB /></div>
                        <div className="auth__logo-text">SQL<span>Lab</span></div>
                    </div>

                    <h1 className="auth__heading">Create account</h1>
                    <p className="auth__subheading">Get started — it's completely free</p>

                    {error && (
                        <div className="auth__error" role="alert">
                            <IconAlert />
                            {error}
                        </div>
                    )}

                    <form className="auth__form" onSubmit={handleSubmit} noValidate>
                        <div className="auth__field">
                            <label htmlFor="name">Full name</label>
                            <div className="auth__input-wrap">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="John Smith"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <IconUser />
                            </div>
                        </div>

                        <div className="auth__field">
                            <label htmlFor="email">Email address</label>
                            <div className="auth__input-wrap">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <IconMail />
                            </div>
                        </div>

                        <div className="auth__field">
                            <label htmlFor="password">Password</label>
                            <div className="auth__input-wrap">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Min. 6 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <IconLock />
                            </div>
                            <PasswordStrength password={form.password} />
                        </div>

                        <div className="auth__field">
                            <label htmlFor="confirm">Confirm password</label>
                            <div className="auth__input-wrap">
                                <input
                                    id="confirm"
                                    name="confirm"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Repeat password"
                                    value={form.confirm}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <IconLock />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`auth__submit${loading ? ' auth__submit--loading' : ''}`}
                            disabled={loading}
                        >
                            <span className="auth__spinner" />
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

                    <p className="auth__footer">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
