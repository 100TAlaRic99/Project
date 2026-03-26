/**
 * taskService.js
 * ──────────────
 * Centralised API layer for all task-related HTTP requests.
 * Uses the Fetch API (no extra dependencies needed).
 * The proxy in package.json forwards /api/* to http://localhost:5000.
 *
 * All functions use authFetch so the JWT is automatically included.
 */

import { authFetch } from "./authService";

const BASE_URL = "/api/tasks";

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * Fetch all tasks belonging to the authenticated user.
 * @returns {Promise<Array>} Array of task objects.
 */
export async function getAllTasks() {
  return authFetch(BASE_URL);
}

/**
 * Fetch tasks filtered by status for the authenticated user.
 * @param {"pending"|"completed"} status
 * @returns {Promise<Array>}
 */
export async function getTasksByStatus(status) {
  return authFetch(`/api/tasks/filter/${status}`);
}

/**
 * Create a new task for the authenticated user.
 * @param {{ title: string, description?: string, priority?: string, due_date?: string }} taskData
 * @returns {Promise<Object>} The created task.
 */
export async function createTask(taskData) {
  return authFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

/**
 * Update an existing task by ID.
 * @param {string} id  MongoDB ObjectId string.
 * @param {Object} updates  Fields to update.
 * @returns {Promise<Object>} The updated task.
 */
export async function updateTask(id, updates) {
  return authFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * Mark a task as completed.
 * @param {string} id  MongoDB ObjectId string.
 * @returns {Promise<Object>} The updated task.
 */
export async function completeTask(id) {
  return authFetch(`${BASE_URL}/${id}/complete`, { method: "PATCH" });
}

/**
 * Delete a task permanently.
 * @param {string} id  MongoDB ObjectId string.
 * @returns {Promise<void>}
 */
export async function deleteTask(id) {
  await authFetch(`${BASE_URL}/${id}`, { method: "DELETE" });
}
