import React from "react";
import "./Navbar.css";

/**
 * Navbar
 * ──────
 * Top navigation bar displaying the app title, stats badge, user info and logout.
 *
 * Props:
 *   pendingCount  {number}   – number of pending tasks
 *   totalCount    {number}   – total number of tasks
 *   user          {Object}   – current logged-in user
 *   onLogout      {Function} – called when the user clicks Logout
 *   onGoDashboard {Function} – called to switch to the dashboard view
 *   view          {string}   – "dashboard" | "tasks"
 */
function Navbar({ pendingCount, totalCount, user, onLogout, onGoDashboard, onGoTasks, view }) {
  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__icon">☑</span>
        <span className="navbar__title">Task Manager</span>
      </div>

      <div className="navbar__center">
        <button
          className={`navbar__nav-btn ${view === "dashboard" ? "navbar__nav-btn--active" : ""}`}
          onClick={onGoDashboard}
        >
          Dashboard
        </button>
        <button
          className={`navbar__nav-btn ${view === "tasks" ? "navbar__nav-btn--active" : ""}`}
          onClick={onGoTasks}
        >
          Tasks
        </button>
      </div>

      <div className="navbar__right">
        <div className="navbar__badge">
          {pendingCount} pending / {totalCount} total
        </div>

        {user && (
          <div className="navbar__user">
            <div className="navbar__avatar">
              {(user.full_name || user.username || "U")[0].toUpperCase()}
            </div>
            <span className="navbar__username">{user.full_name || user.username}</span>
            <button className="navbar__logout" onClick={onLogout} title="Logout">
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
