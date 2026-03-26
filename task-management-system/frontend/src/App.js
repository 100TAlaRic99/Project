import React, { useState, useEffect, useCallback } from "react";
import Navbar       from "./components/Navbar";
import TaskForm     from "./components/TaskForm";
import TaskCard     from "./components/TaskCard";
import FilterBar    from "./components/FilterBar";
import Toast        from "./components/Toast";
import LoginPage    from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Dashboard    from "./components/Dashboard";
import {
  getAllTasks,
  createTask,
  completeTask,
  deleteTask,
  updateTask,
} from "./services/taskService";
import {
  isAuthenticated,
  getStoredUser,
  logout as authLogout,
} from "./services/authService";
import "./App.css";

/**
 * App
 * ───
 * Root component. Manages auth state + task state.
 * Shows Login/Register pages when not authenticated.
 */
function App() {
  // ── Auth state ────────────────────────────────────────────────────────────
  const [user, setUser]         = useState(() => isAuthenticated() ? getStoredUser() : null);
  const [authView, setAuthView] = useState("login"); // "login" | "register"

  // ── Task state ────────────────────────────────────────────────────────────
  const [tasks, setTasks]       = useState([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast]       = useState(null);   // { message, type }
  const [view, setView]         = useState("dashboard"); // "dashboard" | "tasks"

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (message, type = "success") => setToast({ message, type });
  const hideToast = useCallback(() => setToast(null), []);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    showToast(`Welcome back, ${loggedInUser.full_name || loggedInUser.username}! 👋`);
  };

  const handleLogout = async () => {
    await authLogout();
    setUser(null);
    setTasks([]);
    setFetching(true);
    setView("dashboard");
  };

  // ── Fetch all tasks when user logs in ─────────────────────────────────────
  useEffect(() => {
    if (!user) { setFetching(false); return; }
    setFetching(true);
    (async () => {
      try {
        const data = await getAllTasks();
        setTasks(data);
      } catch (err) {
        showToast("Failed to load tasks. Is the backend running?", "error");
      } finally {
        setFetching(false);
      }
    })();
  }, [user]);

  // ── Add a new task ────────────────────────────────────────────────────────
  const handleAdd = async (taskData) => {
    setLoading(true);
    try {
      const created = await createTask(taskData);
      setTasks((prev) => [created, ...prev]);
      showToast("Task added successfully!");
    } catch (err) {
      showToast(err.message || "Failed to add task.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Mark task as completed ────────────────────────────────────────────────
  const handleComplete = async (id) => {
    try {
      const updated = await completeTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast("Task marked as completed! ✓");
    } catch (err) {
      showToast(err.message || "Failed to complete task.", "error");
    }
  };

  // ── Delete a task ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast("Task deleted.");
    } catch (err) {
      showToast(err.message || "Failed to delete task.", "error");
    }
  };

  // ── Edit / update a task ──────────────────────────────────────────────────
  const handleEdit = async (id, updates) => {
    try {
      const updated = await updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast("Task updated.");
    } catch (err) {
      showToast(err.message || "Failed to update task.", "error");
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const pendingTasks   = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const counts = {
    all:       tasks.length,
    pending:   pendingTasks.length,
    completed: completedTasks.length,
  };

  const visibleTasks =
    filter === "pending"   ? pendingTasks   :
    filter === "completed" ? completedTasks :
    tasks;

  // ── Render ────────────────────────────────────────────────────────────────

  // Show auth pages if not logged in
  if (!user) {
    return authView === "login" ? (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setAuthView("register")}
      />
    ) : (
      <RegisterPage
        onLogin={handleLogin}
        onGoLogin={() => setAuthView("login")}
      />
    );
  }

  return (
    <div className="app">
      <Navbar
        pendingCount={counts.pending}
        totalCount={counts.all}
        user={user}
        onLogout={handleLogout}
        onGoDashboard={() => setView("dashboard")}
        onGoTasks={() => setView("tasks")}
        view={view}
      />

      <main className="app__main">
        <div className="app__container">
          {view === "dashboard" ? (
            <Dashboard
              tasks={tasks}
              user={user}
              onNavigate={setView}
            />
          ) : (
            <>
              <div className="app__header">
                <div>
                  <h1 className="app__title">My Tasks</h1>
                  <p className="app__subtitle">Manage your personal tasks</p>
                </div>
              </div>

              <TaskForm onAdd={handleAdd} loading={loading} />

              <FilterBar filter={filter} onChange={setFilter} counts={counts} />

              {fetching ? (
                <div className="app__loading">
                  <div className="spinner" />
                  <p>Loading tasks…</p>
                </div>
              ) : visibleTasks.length === 0 ? (
                <div className="app__empty">
                  <span className="app__empty-icon">📋</span>
                  <p>
                    {filter === "all"
                      ? "No tasks yet. Add your first task above!"
                      : `No ${filter} tasks.`}
                  </p>
                </div>
              ) : (
                <div className="app__task-list">
                  {visibleTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}

export default App;
