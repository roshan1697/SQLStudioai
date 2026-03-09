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

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setError('');
        await new Promise(r => setTimeout(r, 600));
        try {
            login(form.email, form.password);
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
                    <p className="auth__visual-label">SQL Editor Platform</p>
                    <h2 className="auth__visual-headline">
                        Master SQL,<br />one query<br />at a time.
                    </h2>
                    <p className="auth__visual-sub">
                        Practice real-world SQL challenges with an interactive editor. From basic selects to advanced window functions.
                    </p>
                    <div className="auth__visual-chips">
                        {['SELECT', 'JOIN', 'GROUP BY', 'WINDOW FN', 'SUBQUERY', 'CTE'].map(t => (
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

                    <h1 className="auth__heading">Welcome back</h1>
                    <p className="auth__subheading">Sign in to continue your practice</p>

                    {error && (
                        <div className="auth__error" role="alert">
                            <IconAlert />
                            {error}
                        </div>
                    )}

                    <form className="auth__form" onSubmit={handleSubmit} noValidate>
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
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={form.password}
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
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <p className="auth__footer">
                        Don't have an account?{' '}
                        <Link to="/signup">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
