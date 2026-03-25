import React, { useState } from "react";
import "./TaskForm.css";

/**
 * TaskForm
 * ────────
 * Form for adding a new task.
 *
 * Props:
 *   onAdd  {Function}  – called with the new task data object when submitted
 *   loading {boolean}  – disables the submit button while a request is in flight
 */
function TaskForm({ onAdd, loading }) {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]     = useState("medium");
  const [dueDate, setDueDate]       = useState("");
  const [error, setError]           = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    setError("");
    onAdd({ title: title.trim(), description: description.trim(), priority, due_date: dueDate });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
  };

  return (
    <div className="task-form card">
      <h2 className="task-form__heading">
        <span className="task-form__heading-icon">＋</span> Add New Task
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        {error && <p className="task-form__error">{error}</p>}

        <div className="task-form__field">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        </div>

        <div className="task-form__field">
          <label htmlFor="description">Description <span className="optional">(optional)</span></label>
          <textarea
            id="description"
            placeholder="Add more details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="task-form__row">
          <div className="task-form__field">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          <div className="task-form__field">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? "Adding…" : "+ Add Task"}
        </button>
      </form>
    </div>
  );
}

export default TaskForm;
