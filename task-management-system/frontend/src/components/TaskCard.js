import React, { useState } from "react";
import "./TaskCard.css";

/**
 * TaskCard
 * ────────
 * Displays a single task with options to complete, edit, or delete it.
 *
 * Props:
 *   task      {Object}    – task data object from the API
 *   onComplete {Function} – called with task id to mark as completed
 *   onDelete   {Function} – called with task id to delete the task
 *   onEdit     {Function} – called with (id, updatedFields) to save edits
 */
function TaskCard({ task, onComplete, onDelete, onEdit }) {
  const [isEditing, setIsEditing]     = useState(false);
  const [editTitle, setEditTitle]     = useState(task.title);
  const [editDesc, setEditDesc]       = useState(task.description);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.due_date || "");

  const isDone = task.status === "completed";

  const priorityMeta = {
    low:    { label: "Low",    cls: "badge--low" },
    medium: { label: "Medium", cls: "badge--medium" },
    high:   { label: "High",   cls: "badge--high" },
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onEdit(task.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
      due_date: editDueDate,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditDueDate(task.due_date || "");
    setIsEditing(false);
  };

  const formatDate = (iso) => {
    if (!iso) return null;
    // Ensure the string is treated as UTC (append Z if missing)
    const normalized = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  return (
    <div className={`task-card card ${isDone ? "task-card--done" : ""}`}>
      {isEditing ? (
        /* ── Edit Mode ─────────────────────────────────────────────────── */
        <div className="task-card__edit">
          <input
            className="task-card__edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
          />
          <textarea
            className="task-card__edit-textarea"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
          <div className="task-card__edit-row">
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="task-card__edit-select"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="task-card__edit-date"
            />
          </div>
          <div className="task-card__edit-actions">
            <button className="btn btn--primary" onClick={handleSave}>💾 Save</button>
            <button className="btn btn--ghost" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        /* ── View Mode ─────────────────────────────────────────────────── */
        <>
          <div className="task-card__header">
            <button
              className={`task-card__check ${isDone ? "task-card__check--done" : ""}`}
              onClick={() => !isDone && onComplete(task.id)}
              title={isDone ? "Already completed" : "Mark as done"}
              disabled={isDone}
            >
              {isDone ? "✓" : ""}
            </button>

            <div className="task-card__body">
              <h3 className={`task-card__title ${isDone ? "task-card__title--done" : ""}`}>
                {isDone && <span className="task-card__done-prefix">✓ </span>}{task.title}
              </h3>
              {task.description && (
                <p className="task-card__desc">{task.description}</p>
              )}
              <div className="task-card__meta">
                <span className={`badge ${priorityMeta[task.priority]?.cls}`}>
                  {priorityMeta[task.priority]?.label || task.priority}
                </span>
                {task.due_date && (
                  <span className="task-card__due">📅 {task.due_date}</span>
                )}
                <span className="task-card__time">
                  🕐 {formatDate(task.created_at)}
                </span>
              </div>
            </div>

            <div className="task-card__actions">
              <span className={`status-badge ${isDone ? "status-badge--done" : "status-badge--pending"}`}>
                {isDone ? "✓ Done" : "⏳ Pending"}
              </span>
              {!isDone && (
                <button
                  className="btn btn--ghost icon-btn"
                  onClick={() => setIsEditing(true)}
                  title="Edit task"
                >
                  ✏️
                </button>
              )}
              <button
                className="btn btn--danger icon-btn"
                onClick={() => onDelete(task.id)}
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskCard;
