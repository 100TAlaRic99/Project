import React from "react";
import "./Dashboard.css";

/**
 * Dashboard
 * ────────
 * Overview panel showing task statistics, a priority breakdown chart,
 * and recent tasks for the logged-in user.
 *
 * Props:
 *   tasks        {Array}   – full list of tasks
 *   user         {Object}  – current user object
 *   onNavigate   {Function}– called with "tasks" to switch back to task list
 */
function Dashboard({ tasks, user, onNavigate }) {
  // ── Counts ────────────────────────────────────────────────────────────────
  const total     = tasks.length;
  const pending   = tasks.filter((t) => t.status === "pending").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(
    (t) =>
      t.status === "pending" &&
      t.due_date &&
      new Date(t.due_date) < today
  ).length;

  // ── Priority breakdown ────────────────────────────────────────────────────
  const byPriority = ["high", "medium", "low"].map((p) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1),
    count: tasks.filter((t) => t.priority === p).length,
    cls: `priority--${p}`,
  }));

  const maxCount = Math.max(...byPriority.map((p) => p.count), 1);

  // ── Recent tasks (last 5) ────────────────────────────────────────────────
  const recentTasks = [...tasks]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 5);

  // ── Completion rate ───────────────────────────────────────────────────────
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  // SVG circle: r=48, circumference = 2π·48 ≈ 301.59
  const CIRCUMFERENCE = 2 * Math.PI * 48; // ≈ 301.59
  const dashFill     = (completionRate / 100) * CIRCUMFERENCE;
  const dashOffset   = CIRCUMFERENCE - dashFill;

  return (
    <div className="dashboard">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="dashboard__header">
        <div className="dashboard__welcome">
          <h1 className="dashboard__title">
            Good {getTimeOfDay()}, {user.full_name || user.username} 👋
          </h1>
          <p className="dashboard__subtitle">
            Here's what's happening with your tasks today.
          </p>
        </div>
        <button className="dashboard__add-btn" onClick={() => onNavigate("tasks")}>
          <span>+</span> New Task
        </button>
      </div>

      {/* ── Stats cards ─────────────────────────────────────────────────── */}
      <div className="dashboard__stats">
        <div className="stat-card stat-card--total">
          <div className="stat-card__icon">📋</div>
          <div className="stat-card__body">
            <span className="stat-card__value">{total}</span>
            <span className="stat-card__label">Total Tasks</span>
          </div>
        </div>

        <div className="stat-card stat-card--pending">
          <div className="stat-card__icon">⏳</div>
          <div className="stat-card__body">
            <span className="stat-card__value">{pending}</span>
            <span className="stat-card__label">Pending</span>
          </div>
        </div>

        <div className="stat-card stat-card--completed">
          <div className="stat-card__icon">✅</div>
          <div className="stat-card__body">
            <span className="stat-card__value">{completed}</span>
            <span className="stat-card__label">Completed</span>
          </div>
        </div>

        <div className="stat-card stat-card--overdue">
          <div className="stat-card__icon">🚨</div>
          <div className="stat-card__body">
            <span className="stat-card__value">{overdue}</span>
            <span className="stat-card__label">Overdue</span>
          </div>
        </div>
      </div>

      {/* ── Charts row ───────────────────────────────────────────────────── */}
      <div className="dashboard__charts">

        {/* Completion donut */}
        <div className="chart-card">
          <h3 className="chart-card__title">Completion Rate</h3>
          <div className="donut-wrap">
            <svg className="donut" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="48" stroke="#e5e7eb" strokeWidth="14" />
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="#2563eb"
                strokeWidth="14"
                strokeDasharray={`${dashFill} ${CIRCUMFERENCE}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="donut__arc"
              />
              <text x="60" y="57" textAnchor="middle" className="donut__pct">
                {completionRate}%
              </text>
              <text x="60" y="72" textAnchor="middle" className="donut__sub">
                done
              </text>
            </svg>
          </div>
          <p className="chart-card__caption">
            {completed} of {total} tasks completed
          </p>
        </div>

        {/* Priority breakdown */}
        <div className="chart-card">
          <h3 className="chart-card__title">Priority Breakdown</h3>
          <div className="priority-bars">
            {byPriority.map((p) => (
              <div key={p.label} className="priority-row">
                <span className="priority-row__label">{p.label}</span>
                <div className="priority-row__track">
                  <div
                    className={`priority-row__fill ${p.cls}`}
                    style={{ width: `${(p.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="priority-row__count">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick info */}
        <div className="chart-card chart-card--info">
          <h3 className="chart-card__title">Quick Info</h3>
          <ul className="quick-info">
            <li>
              <span className="quick-info__icon">📅</span>
              <span>{formatDate(today)}</span>
            </li>
            <li>
              <span className="quick-info__icon">🔥</span>
              <span>
                {pending > 0
                  ? `${pending} task${pending > 1 ? "s" : ""} waiting`
                  : "All caught up!"}
              </span>
            </li>
            <li>
              <span className="quick-info__icon">⭐</span>
              <span>
                {byPriority.find((p) => p.label === "High")?.count > 0
                  ? `${byPriority.find((p) => p.label === "High").count} high priority task${byPriority.find((p) => p.label === "High").count > 1 ? "s" : ""}`
                  : "No high priority tasks"}
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* ── Recent tasks ────────────────────────────────────────────────── */}
      <div className="dashboard__recent">
        <div className="recent-header">
          <h3 className="recent-header__title">Recent Tasks</h3>
          <button className="recent-header__link" onClick={() => onNavigate("tasks")}>
            View all →
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <div className="recent-empty">
            <span>📋</span>
            <p>No tasks yet. Add your first task!</p>
          </div>
        ) : (
          <div className="recent-list">
            {recentTasks.map((task) => (
              <div key={task.id} className={`recent-item ${task.status === "completed" ? "recent-item--done" : ""}`}>
                <div className="recent-item__check">
                  {task.status === "completed" ? "✓" : "○"}
                </div>
                <div className="recent-item__body">
                  <span className="recent-item__title">{task.title}</span>
                  <div className="recent-item__meta">
                    <span className={`badge badge--${task.priority}`}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className="recent-item__date">
                        Due {formatDate(new Date(task.due_date))}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`recent-item__status status--${task.status}`}>
                  {task.status === "completed" ? "Done" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default Dashboard;
