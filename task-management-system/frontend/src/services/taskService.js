/**
 * taskService.js
 * ──────────────
 * Centralised API layer for all task-related HTTP requests.
 * Uses the Fetch API (no extra dependencies needed).
 * The proxy in package.json forwards /api/* to http://localhost:5000.
 */

const BASE_URL = "/api/tasks";

// ── Helper ────────────────────────────────────────────────────────────────────
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * Fetch all tasks from the backend.
 * @returns {Promise<Array>} Array of task objects.
 */
export async function getAllTasks() {
  const res = await fetch(BASE_URL);
  return handleResponse(res);
}

/**
 * Fetch tasks filtered by status.
 * @param {"pending"|"completed"} status
 * @returns {Promise<Array>}
 */
export async function getTasksByStatus(status) {
  const res = await fetch(`/api/tasks/filter/${status}`);
  return handleResponse(res);
}

/**
 * Create a new task.
 * @param {{ title: string, description?: string, priority?: string, due_date?: string }} taskData
 * @returns {Promise<Object>} The created task.
 */
export async function createTask(taskData) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  return handleResponse(res);
}

/**
 * Update an existing task by ID.
 * @param {string} id  MongoDB ObjectId string.
 * @param {Object} updates  Fields to update.
 * @returns {Promise<Object>} The updated task.
 */
export async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

/**
 * Mark a task as completed.
 * @param {string} id  MongoDB ObjectId string.
 * @returns {Promise<Object>} The updated task.
 */
export async function completeTask(id) {
  const res = await fetch(`${BASE_URL}/${id}/complete`, { method: "PATCH" });
  return handleResponse(res);
}

/**
 * Delete a task permanently.
 * @param {string} id  MongoDB ObjectId string.
 * @returns {Promise<Object>} Success message.
 */
export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}
