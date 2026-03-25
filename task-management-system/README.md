# ☑ Task Management System

A full-stack task management web application built with **React** (frontend), **Flask** (backend), and **MongoDB** (database).

---

## 📁 Project Structure

```
task-management-system/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React UI components
│   │   ├── services/       # API service layer
│   │   ├── App.js          # Root component
│   │   └── index.js        # Entry point
│   └── package.json
└── README.md
```

---

## ✅ Prerequisites

Make sure the following are installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.9+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| MongoDB | 6+ | https://www.mongodb.com/try/download/community |
| npm | 9+ | Comes with Node.js |

---

## 🚀 How to Start the Application

### Step 1 — Start MongoDB

Make sure MongoDB is running locally on the default port `27017`.

**Windows:**
```powershell
# If installed as a service, it may already be running.
# To start manually:
net start MongoDB
```

**macOS / Linux:**
```bash
mongod --dbpath /data/db
```

---

### Step 2 — Start the Backend (Flask)

Open a terminal and run:

```powershell
# Navigate to the backend folder
cd task-management-system\backend

# (Recommended) Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Copy the environment file (optional)
copy .env.example .env

# Start the Flask server
python app.py
```

The backend will start at: **http://localhost:5000**

You can verify it's running by visiting: http://localhost:5000/api/health

---

### Step 3 — Start the Frontend (React)

Open a **new** terminal and run:

```powershell
# Navigate to the frontend folder
cd task-management-system\frontend

# Install Node.js dependencies
npm install

# Start the React development server
npm start
```

The frontend will open automatically at: **http://localhost:3000**

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| PATCH | `/api/tasks/:id/complete` | Mark task as completed |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/tasks/filter/:status` | Filter by status (pending/completed) |

---

## 🛠 Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust as needed:

```env
MONGO_URI=mongodb://localhost:27017/
FLASK_ENV=development
FLASK_DEBUG=1
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, HTML5, CSS3, JavaScript (ES6+) |
| Backend | Python 3, Flask 3, Flask-CORS |
| Database | MongoDB (via PyMongo) |
| HTTP Client | Fetch API (built-in browser) |

---

## 🔧 Troubleshooting

- **CORS errors** — Make sure the Flask server is running and `flask-cors` is installed.
- **MongoDB connection refused** — Ensure MongoDB service is started.
- **Port 3000 in use** — React will prompt you to use another port; press `Y`.
- **Port 5000 in use** — Change the port in `app.py` (`port=5001`) and update `package.json` proxy.
