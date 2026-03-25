# 📖 Functions Summary — Task Management System

A complete reference of every function, component, and API endpoint in the project.

---

## 🐍 Backend — `backend/app.py` (Flask)

### Helper Function

| Function | Description |
|----------|-------------|
| `serialize_task(task)` | Converts a raw MongoDB BSON document into a JSON-serialisable Python dictionary. Converts `ObjectId` → string and `datetime` → ISO string. |

---

### API Route Functions

| Function / Route | Method | Endpoint | Description |
|-----------------|--------|----------|-------------|
| `health_check()` | GET | `/api/health` | Returns `{"status": "ok"}` to confirm the API is alive. |
| `get_all_tasks()` | GET | `/api/tasks` | Retrieves **all** tasks from MongoDB, sorted newest-first. Returns a JSON array. |
| `get_task(task_id)` | GET | `/api/tasks/<task_id>` | Retrieves a **single** task by its MongoDB `ObjectId`. Returns 404 if not found, 400 if the ID format is invalid. |
| `create_task()` | POST | `/api/tasks` | Creates a new task. Requires `title` in the JSON body. Optional fields: `description`, `priority` (`low`/`medium`/`high`), `due_date`. Returns the created task with HTTP 201. |
| `update_task(task_id)` | PUT | `/api/tasks/<task_id>` | Updates any subset of a task's fields (`title`, `description`, `priority`, `status`, `due_date`). Returns the updated task or 404. |
| `complete_task(task_id)` | PATCH | `/api/tasks/<task_id>/complete` | Convenience endpoint that sets `status = "completed"` on a task. Returns the updated task or 404. |
| `delete_task(task_id)` | DELETE | `/api/tasks/<task_id>` | Permanently removes a task from MongoDB. Returns a success message or 404. |
| `filter_tasks_by_status(status)` | GET | `/api/tasks/filter/<status>` | Returns tasks filtered by `status` (`pending` or `completed`), sorted newest-first. |

---

## ⚛️ Frontend — React Components (`frontend/src/`)

### `App.js` — Root Component

| Function / Handler | Description |
|-------------------|-------------|
| `App()` | Root React component. Manages global task state (`tasks`, `filter`, `loading`, `fetching`, `toast`). Fetches all tasks on mount via `useEffect`. |
| `showToast(message, type)` | Sets the `toast` state to display a temporary notification. `type` can be `"success"`, `"error"`, or `"info"`. |
| `hideToast()` | Clears the `toast` state, dismissing the notification. Wrapped in `useCallback` to prevent unnecessary re-renders. |
| `handleAdd(taskData)` | Calls `createTask()` from the service layer, prepends the new task to state, and shows a success toast. |
| `handleComplete(id)` | Calls `completeTask(id)`, updates the matching task in state to `status: "completed"`. |
| `handleDelete(id)` | Calls `deleteTask(id)`, removes the task from state. |
| `handleEdit(id, updates)` | Calls `updateTask(id, updates)`, replaces the old task object in state with the updated one. |

**Derived state computed inside `App`:**

| Variable | Description |
|----------|-------------|
| `pendingTasks` | Filtered array of tasks with `status === "pending"`. |
| `completedTasks` | Filtered array of tasks with `status === "completed"`. |
| `counts` | Object `{ all, pending, completed }` with task counts for each category. |
| `visibleTasks` | The subset of tasks shown based on the active `filter`. |

---

### `components/Navbar.js`

| Function | Description |
|----------|-------------|
| `Navbar({ pendingCount, totalCount })` | Renders the top navigation bar with the app logo/title and a badge showing `X pending / Y total`. |

---

### `components/TaskForm.js`

| Function | Description |
|----------|-------------|
| `TaskForm({ onAdd, loading })` | Controlled form component for creating a new task. Manages local state for `title`, `description`, `priority`, and `dueDate`. Validates that `title` is not empty before calling `onAdd`. Resets all fields after successful submission. |
| `handleSubmit(e)` | Form submit handler. Validates input, calls `onAdd` with the task data, and resets the form. |

---

### `components/TaskCard.js`

| Function | Description |
|----------|-------------|
| `TaskCard({ task, onComplete, onDelete, onEdit })` | Displays a single task card. Supports two modes: **view mode** (shows task details, status badge, action buttons) and **edit mode** (inline form to update the task). |
| `handleSave()` | Validates the edited title, calls `onEdit(id, updatedFields)`, and exits edit mode. |
| `handleCancel()` | Resets all edit fields back to the original task values and exits edit mode. |
| `formatDate(iso)` | Formats an ISO datetime string into a human-readable locale string (e.g., `Mar 25, 2026 at 08:20 AM`). |

---

### `components/FilterBar.js`

| Function | Description |
|----------|-------------|
| `FilterBar({ filter, onChange, counts })` | Renders three tab buttons: **All**, **Pending**, **Completed**. Each tab shows its task count. Calls `onChange` with the selected filter key when clicked. |

---

### `components/Toast.js`

| Function | Description |
|----------|-------------|
| `Toast({ message, type, onClose })` | Displays a temporary notification at the bottom-right of the screen. Auto-dismisses after **3 seconds** using `useEffect` + `setTimeout`. Supports `success`, `error`, and `info` types with distinct colours. |

---

## 🔌 Frontend — API Service Layer (`frontend/src/services/taskService.js`)

All functions return Promises and throw an `Error` with a descriptive message on failure.

| Function | HTTP Call | Description |
|----------|-----------|-------------|
| `getAllTasks()` | `GET /api/tasks` | Fetches all tasks from the backend. |
| `getTasksByStatus(status)` | `GET /api/tasks/filter/:status` | Fetches tasks filtered by `"pending"` or `"completed"`. |
| `createTask(taskData)` | `POST /api/tasks` | Sends a new task payload to the backend. |
| `updateTask(id, updates)` | `PUT /api/tasks/:id` | Sends partial or full update fields for a task. |
| `completeTask(id)` | `PATCH /api/tasks/:id/complete` | Marks a task as completed. |
| `deleteTask(id)` | `DELETE /api/tasks/:id` | Permanently deletes a task. |
| `handleResponse(res)` *(internal)* | — | Parses the JSON response and throws an error if `res.ok` is false. Used internally by all service functions. |

---

## 🗄️ Database Schema — MongoDB Collection: `tasks`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | — | MongoDB auto-generated unique identifier |
| `title` | String | ✅ Yes | — | Short description of the task |
| `description` | String | No | `""` | Optional longer description |
| `priority` | String | No | `"medium"` | Task urgency: `"low"`, `"medium"`, or `"high"` |
| `status` | String | Auto | `"pending"` | Task state: `"pending"` or `"completed"` |
| `due_date` | String | No | `""` | Optional due date in `YYYY-MM-DD` format |
| `created_at` | DateTime | Auto | `utcnow()` | Timestamp when the task was created |
