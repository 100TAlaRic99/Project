import React, { useState } from "react";
import { login } from "../services/authService";
import "./AuthPage.css";

/**
 * LoginPage
 * ─────────
 * Sign-in form with 3 separate fields: Username, Email, Password.
 *
 * Props:
 *   onLogin      {Function}  – called with the user object after successful login
 *   onGoRegister {Function}  – switches the view to the Register page
 */
function LoginPage({ onLogin, onGoRegister }) {
  const [form, setForm]         = useState({ username: "", email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim())
      errs.username = "Username is required.";
    if (!form.email.trim())
      errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "Enter a valid email address.";
    if (!form.password)
      errs.password = "Password is required.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // Backend accepts username OR email — send whichever the user filled
      const user = await login({
        username: form.email.trim().toLowerCase() || form.username.trim().toLowerCase(),
        password: form.password,
      });
      onLogin(user);
    } catch (err) {
      setApiError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand">
          <div className="auth-brand__logo">☑</div>
          <h1 className="auth-brand__name">Task Manager</h1>
          <p className="auth-brand__tagline">Organise your work. Achieve your goals.</p>
        </div>
        <ul className="auth-features">
          <li><span className="auth-features__icon">✓</span> Track tasks with priorities &amp; due dates</li>
          <li><span className="auth-features__icon">✓</span> Filter by status — Pending or Completed</li>
          <li><span className="auth-features__icon">✓</span> Secure, personal task management</li>
        </ul>
      </div>

      {/* Right form panel */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-card">
          <div className="auth-card__header">
            <h2 className="auth-card__title">Sign In</h2>
            <p className="auth-card__subtitle">Welcome back! Enter your credentials below.</p>
          </div>

          {apiError && <div className="auth-alert auth-alert--error">⚠️ {apiError}</div>}

          <form onSubmit={handleSubmit} noValidate className="auth-form">

            {/* Username */}
            <div className={`auth-field ${errors.username ? "auth-field--error" : ""}`}>
              <label htmlFor="login-username">Username</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="login-username"
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={set("username")}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              {errors.username && <p className="auth-field__error">{errors.username}</p>}
            </div>

            {/* Email */}
            <div className={`auth-field ${errors.email ? "auth-field--error" : ""}`}>
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="auth-field__error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className={`auth-field ${errors.password ? "auth-field--error" : ""}`}>
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.password && <p className="auth-field__error">{errors.password}</p>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading && <span className="auth-btn__spinner" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>Don’t have an account? <button className="auth-link" onClick={onGoRegister}>Register here</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

