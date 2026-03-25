import React, { useState } from "react";
import { register } from "../services/authService";
import "./AuthPage.css";

/**
 * RegisterPage
 * ────────────
 * Sign-up form with full validation.
 * Fields: Full Name, Username, Email, Password, Confirm Password.
 *
 * Props:
 *   onLogin   {Function}  – called with the user object after successful registration
 *   onGoLogin {Function}  – switches the view back to the Login page
 */
function RegisterPage({ onLogin, onGoLogin }) {
  const [form, setForm] = useState({
    full_name:        "",
    username:         "",
    email:            "",
    password:         "",
    confirm_password: "",
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())
      errs.full_name = "Full name is required.";

    if (!form.username.trim())
      errs.username = "Username is required.";
    else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username.trim()))
      errs.username = "3-30 chars: letters, numbers, underscores only.";

    if (!form.email.trim())
      errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "Enter a valid email address.";

    if (!form.password)
      errs.password = "Password is required.";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";

    if (!form.confirm_password)
      errs.confirm_password = "Please confirm your password.";
    else if (form.password !== form.confirm_password)
      errs.confirm_password = "Passwords do not match.";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const user = await register({
        full_name:        form.full_name.trim(),
        username:         form.username.trim(),
        email:            form.email.trim().toLowerCase(),
        password:         form.password,
        confirm_password: form.confirm_password,
      });
      onLogin(user);
    } catch (err) {
      // Backend may return field-level errors
      if (err.message) setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const EyeOpen  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  const EyeClose = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

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
        <div className="auth-card auth-card--wide">
          <div className="auth-card__header">
            <h2 className="auth-card__title">Create Account</h2>
            <p className="auth-card__subtitle">Fill in the details below to get started.</p>
          </div>

          {apiError && <div className="auth-alert auth-alert--error">⚠️ {apiError}</div>}

          <form onSubmit={handleSubmit} noValidate className="auth-form">

            {/* Full Name */}
            <div className={`auth-field ${errors.full_name ? "auth-field--error" : ""}`}>
              <label htmlFor="reg-fullname">Full Name</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input id="reg-fullname" type="text" placeholder="Your full name"
                  value={form.full_name} onChange={set("full_name")} autoFocus />
              </div>
              {errors.full_name && <p className="auth-field__error">{errors.full_name}</p>}
            </div>

            {/* Username */}
            <div className={`auth-field ${errors.username ? "auth-field--error" : ""}`}>
              <label htmlFor="reg-username">Username</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input id="reg-username" type="text" placeholder="e.g. john_doe"
                  value={form.username} onChange={set("username")} autoComplete="username" />
              </div>
              {errors.username && <p className="auth-field__error">{errors.username}</p>}
            </div>

            {/* Email */}
            <div className={`auth-field ${errors.email ? "auth-field--error" : ""}`}>
              <label htmlFor="reg-email">Email Address</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input id="reg-email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={set("email")} autoComplete="email" />
              </div>
              {errors.email && <p className="auth-field__error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className={`auth-field ${errors.password ? "auth-field--error" : ""}`}>
              <label htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="reg-password" type={showPwd ? "text" : "password"} placeholder="Min. 8 characters"
                  value={form.password} onChange={set("password")} autoComplete="new-password" />
                <button type="button" className="auth-input-toggle" onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                  {showPwd ? <EyeClose /> : <EyeOpen />}
                </button>
              </div>
              {errors.password && <p className="auth-field__error">{errors.password}</p>}
              {form.password && (
                <div className="auth-strength">
                  <div className={`auth-strength__bar auth-strength__bar--${form.password.length >= 12 ? "strong" : form.password.length >= 8 ? "medium" : "weak"}`} />
                  <span className="auth-strength__label">{form.password.length >= 12 ? "Strong" : form.password.length >= 8 ? "Medium" : "Weak"}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={`auth-field ${errors.confirm_password ? "auth-field--error" : ""}`}>
              <label htmlFor="reg-confirm">Confirm Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="reg-confirm" type={showCPwd ? "text" : "password"} placeholder="Re-enter your password"
                  value={form.confirm_password} onChange={set("confirm_password")} autoComplete="new-password" />
                <button type="button" className="auth-input-toggle" onClick={() => setShowCPwd(v => !v)} tabIndex={-1}>
                  {showCPwd ? <EyeClose /> : <EyeOpen />}
                </button>
              </div>
              {errors.confirm_password && <p className="auth-field__error">{errors.confirm_password}</p>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading && <span className="auth-btn__spinner" />}
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>Already have an account? <button className="auth-link" onClick={onGoLogin}>Sign in here</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
