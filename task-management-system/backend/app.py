from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
from functools import wraps
import os
import re
import bcrypt
import jwt

app = Flask(__name__)
CORS(app, supports_credentials=True)

# ─── Config ───────────────────────────────────────────────────────────────────
JWT_SECRET  = os.environ.get("JWT_SECRET", "change-me-in-production-secret-key")
JWT_EXPIRES = int(os.environ.get("JWT_EXPIRES_HOURS", 24))   # hours

# ─── MongoDB Connection ────────────────────────────────────────────────────────
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["TaskManagementSystem"]
tasks_collection = db["tasks"]
users_collection = db["users"]

# Ensure unique index on username and email
users_collection.create_index("username", unique=True)
users_collection.create_index("email",    unique=True)

# ─── Auth Helpers ─────────────────────────────────────────────────────────────
def make_token(user_id: str) -> str:
    """Generate a signed JWT for the given user id."""
    payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def token_required(f):
    """Decorator that validates the Bearer JWT on protected routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token."}), 401
        user = users_collection.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            return jsonify({"error": "User not found."}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated


def serialize_user(user: dict) -> dict:
    """Return a safe (no password) user dict."""
    return {
        "id":         str(user["_id"]),
        "username":   user.get("username", ""),
        "email":      user.get("email", ""),
        "full_name":  user.get("full_name", ""),
        "created_at": user.get("created_at", "").isoformat() + "Z"
                      if isinstance(user.get("created_at"), datetime)
                      else user.get("created_at", ""),
    }


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# ─── Helper: Convert MongoDB document to JSON-serialisable dict ───────────────
def serialize_task(task):
    return {
        "id": str(task["_id"]),
        "title": task.get("title", ""),
        "description": task.get("description", ""),
        "priority": task.get("priority", "medium"),
        "status": task.get("status", "pending"),
        "due_date": task.get("due_date", ""),
        # Append "Z" to signal UTC so the browser parses it correctly as local time.
        "created_at": task.get("created_at", "").isoformat() + "Z"
        if isinstance(task.get("created_at"), datetime)
        else task.get("created_at", ""),
    }


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/api/tasks", methods=["GET"])
@token_required
def get_all_tasks():
    """
    Retrieve all tasks belonging to the authenticated user,
    sorted by creation date (newest first).
    """
    tasks = list(
        tasks_collection
            .find({"user_id": request.current_user["_id"]})
            .sort("created_at", -1)
    )
    return jsonify([serialize_task(t) for t in tasks]), 200


@app.route("/api/tasks/<task_id>", methods=["GET"])
@token_required
def get_task(task_id):
    """
    Retrieve a single task belonging to the authenticated user.
    Returns 404 if the task does not exist.
    """
    try:
        task = tasks_collection.find_one({
            "_id": ObjectId(task_id),
            "user_id": request.current_user["_id"],
        })
    except Exception:
        return jsonify({"error": "Invalid task ID format"}), 400

    if not task:
        return jsonify({"error": "Task not found"}), 404

    return jsonify(serialize_task(task)), 200


@app.route("/api/tasks", methods=["POST"])
@token_required
def create_task():
    """
    Create a new task belonging to the authenticated user.
    Expected JSON body:
      - title       (required) : string
      - description (optional) : string
      - priority    (optional) : 'low' | 'medium' | 'high'  (default: 'medium')
      - due_date    (optional) : string  (YYYY-MM-DD)
    Returns the newly created task with HTTP 201.
    """
    data = request.get_json()

    if not data or not data.get("title", "").strip():
        return jsonify({"error": "Task title is required"}), 400

    new_task = {
        "user_id":     request.current_user["_id"],
        "title":       data["title"].strip(),
        "description": data.get("description", "").strip(),
        "priority":    data.get("priority", "medium"),
        "status":      "pending",
        "due_date":    data.get("due_date", ""),
        "created_at":  datetime.utcnow(),
    }

    result = tasks_collection.insert_one(new_task)
    new_task["_id"] = result.inserted_id
    return jsonify(serialize_task(new_task)), 201


@app.route("/api/tasks/<task_id>", methods=["PUT"])
@token_required
def update_task(task_id):
    """
    Update an existing task belonging to the authenticated user.
    Accepts any subset of the task fields in the JSON body.
    Returns the updated task or 404 if not found.
    """
    try:
        oid = ObjectId(task_id)
    except Exception:
        return jsonify({"error": "Invalid task ID format"}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "No update data provided"}), 400

    allowed_fields = {"title", "description", "priority", "status", "due_date"}
    update_data = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    result = tasks_collection.find_one_and_update(
        {"_id": oid, "user_id": request.current_user["_id"]},
        {"$set": update_data},
        return_document=True,
    )

    if not result:
        return jsonify({"error": "Task not found"}), 404

    return jsonify(serialize_task(result)), 200


@app.route("/api/tasks/<task_id>/complete", methods=["PATCH"])
@token_required
def complete_task(task_id):
    """
    Mark a task as 'completed'. Only works on tasks owned by the authenticated user.
    This is a convenience endpoint — equivalent to PUT with status='completed'.
    Returns the updated task or 404 if not found.
    """
    try:
        oid = ObjectId(task_id)
    except Exception:
        return jsonify({"error": "Invalid task ID format"}), 400

    result = tasks_collection.find_one_and_update(
        {"_id": oid, "user_id": request.current_user["_id"]},
        {"$set": {"status": "completed"}},
        return_document=True,
    )

    if not result:
        return jsonify({"error": "Task not found"}), 404

    return jsonify(serialize_task(result)), 200


@app.route("/api/tasks/<task_id>", methods=["DELETE"])
@token_required
def delete_task(task_id):
    """
    Permanently delete a task owned by the authenticated user.
    Returns a success message or 404 if not found.
    """
    try:
        oid = ObjectId(task_id)
    except Exception:
        return jsonify({"error": "Invalid task ID format"}), 400

    result = tasks_collection.delete_one({
        "_id": oid,
        "user_id": request.current_user["_id"],
    })

    if result.deleted_count == 0:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task deleted successfully"}), 200


@app.route("/api/tasks/filter/<status>", methods=["GET"])
@token_required
def filter_tasks_by_status(status):
    """
    Filter tasks by status for the authenticated user: 'pending' or 'completed'.
    Returns a JSON list of matching tasks.
    """
    valid_statuses = {"pending", "completed"}
    if status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Use: {', '.join(valid_statuses)}"}), 400

    tasks = list(
        tasks_collection
            .find({"status": status, "user_id": request.current_user["_id"]})
            .sort("created_at", -1)
    )
    return jsonify([serialize_task(t) for t in tasks]), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health-check endpoint to verify the API is running."""
    return jsonify({"status": "ok", "message": "Task Management API is running"}), 200


# ─── Auth Routes ──────────────────────────────────────────────────────────────

@app.route("/api/auth/register", methods=["POST"])
def register():
    """
    Register a new user.
    Required JSON body:
      - username     : 3-30 chars, alphanumeric + underscores
      - email        : valid email address
      - full_name    : display name
      - password     : min 8 chars
      - confirm_password : must match password
    Returns the created user + JWT token.
    """
    data = request.get_json() or {}

    username         = data.get("username", "").strip()
    email            = data.get("email", "").strip().lower()
    full_name        = data.get("full_name", "").strip()
    password         = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    # ── Validation ────────────────────────────────────────────────────────
    errors = {}
    if not username:
        errors["username"] = "Username is required."
    elif not re.match(r"^[a-zA-Z0-9_]{3,30}$", username):
        errors["username"] = "Username must be 3-30 chars (letters, numbers, underscores)."

    if not email:
        errors["email"] = "Email is required."
    elif not EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."

    if not full_name:
        errors["full_name"] = "Full name is required."

    if not password:
        errors["password"] = "Password is required."
    elif len(password) < 8:
        errors["password"] = "Password must be at least 8 characters."

    if not confirm_password:
        errors["confirm_password"] = "Please confirm your password."
    elif password and password != confirm_password:
        errors["confirm_password"] = "Passwords do not match."

    if errors:
        return jsonify({"error": "Validation failed", "fields": errors}), 422

    # ── Uniqueness check ──────────────────────────────────────────────────
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Validation failed",
                        "fields": {"username": "Username is already taken."}}), 409
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Validation failed",
                        "fields": {"email": "An account with this email already exists."}}), 409

    # ── Hash password & save ──────────────────────────────────────────────
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    new_user = {
        "username":   username,
        "email":      email,
        "full_name":  full_name,
        "password":   hashed,
        "created_at": datetime.utcnow(),
    }
    result = users_collection.insert_one(new_user)
    new_user["_id"] = result.inserted_id

    token = make_token(str(result.inserted_id))
    return jsonify({"user": serialize_user(new_user), "token": token}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    """
    Log in with username (or email) + password.
    Required JSON body:
      - username  : username OR email
      - password  : plain-text password
    Returns the user object + JWT token.
    """
    data = request.get_json() or {}
    identifier = data.get("username", "").strip().lower()
    password   = data.get("password", "")

    if not identifier or not password:
        return jsonify({"error": "Username/email and password are required."}), 400

    # Allow login with either username or email
    user = users_collection.find_one(
        {"$or": [{"username": identifier}, {"email": identifier}]}
    )

    if not user or not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"error": "Invalid username or password."}), 401

    token = make_token(str(user["_id"]))
    return jsonify({"user": serialize_user(user), "token": token}), 200


@app.route("/api/auth/me", methods=["GET"])
@token_required
def get_me():
    """Return the currently authenticated user's profile."""
    return jsonify(serialize_user(request.current_user)), 200


@app.route("/api/auth/logout", methods=["POST"])
@token_required
def logout():
    """
    Logout endpoint. JWT is stateless so the client simply discards the token.
    This endpoint exists for a clean API contract.
    """
    return jsonify({"message": "Logged out successfully."}), 200


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
