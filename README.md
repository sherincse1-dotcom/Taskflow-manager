# TaskFlow — Smart Task Manager 📋

A complete, modern full-stack task management web application designed for presentations and production deployment. Built with **React**, **Express**, and **Google Cloud Firestore**.

---

## 🌟 Key Features

1. **Full CRUD Operations**:
   - **Create**: Add tasks with title, description, priority (Low, Medium, High), and due date.
   - **Read**: Display all tasks retrieved directly from Google Cloud Firestore.
   - **Update**: Edit existing tasks, priority, due dates, and notes.
   - **Toggle Status**: Instantly mark tasks as Completed or In Progress.
   - **Delete**: Safe removal with a confirmation modal to prevent accidental data loss.

2. **Dashboard Analytics & Progress**:
   - Real-time summary cards: **Total Tasks**, **Pending Tasks**, **Completed Tasks**, and **Completion Rate (%)** with animated progress indicator.

3. **Filtering & Search**:
   - Filter by tabs: **All**, **In Progress**, **Completed**, and **High Priority**.
   - Live search bar filtering by task title or description.
   - Sort dropdown: Due Date (Earliest / Latest), Priority (High to Low), and Newest.

4. **100% Real Database Persistence**:
   - Every action updates records in Google Cloud Firestore.
   - Refreshing or closing the browser retains all tasks permanently.
   - Live Database status banner confirming Firestore connectivity and Database ID.

5. **Responsive Design**:
   - Tailored palette: Modern lavender (`#ede9fe`), rich purple (`#7c3aed`), crisp white, and subtle slate grey.
   - Fully optimized for desktop, tablet, and mobile devices (with mobile drawer sidebar).

6. **College Presentation Demo Helpers**:
   - "Load Sample Tasks (Demo Data)" one-click button to quickly showcase all states and filters in front of the class.

---

## 🏗️ Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│      Tailwind CSS • Lucide Icons • Responsive UI       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Node.js + Express API                  │
│       REST Endpoints • Input Validation • Port 3000    │
└───────────────────────────┬────────────────────────────┘
                            │ Firestore SDK / Admin
                            ▼
┌────────────────────────────────────────────────────────┐
│              Google Cloud Firestore DB                 │
│         Persistent Document Store (`/tasks`)           │
└────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons.
- **Backend**: Node.js, Express, TypeScript (`tsx`).
- **Database**: Google Cloud Firestore (via `firebase-applet-config.json` and Firebase SDK).

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health-check endpoint verifying Firestore connectivity | `200`, `500` |
| `GET` | `/api/tasks` | Get all tasks (ordered by creation timestamp) | `200`, `500` |
| `GET` | `/api/tasks/:id` | Get details of a single task by ID | `200`, `404`, `500` |
| `POST` | `/api/tasks` | Create a new task (validates title, priority, due date) | `201`, `400`, `500` |
| `PUT` | `/api/tasks/:id` | Update an existing task or toggle status | `200`, `400`, `404`, `500` |
| `DELETE` | `/api/tasks/:id` | Delete a task from Firestore | `200`, `404`, `500` |
| `POST` | `/api/tasks/seed` | Seed initial presentation demo tasks | `201`, `500` |

### Sample JSON Payloads

#### Create Task (`POST /api/tasks`)
```json
{
  "title": "Finalize College Presentation",
  "description": "Walk through database schema, REST API routes, and live demo.",
  "priority": "high",
  "dueDate": "2026-10-12",
  "status": "pending"
}
```

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the full-stack server**:
   ```bash
   npm run dev
   ```
   This launches Express at `http://localhost:3000` with Vite middleware mounted automatically.

3. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## ☁️ Deployment

- **Google Cloud Run / AI Studio**:
  The application is pre-configured with `server.ts` as the entrypoint. When deployed, it automatically serves both the Express REST API and the compiled React production assets from `dist/` on port `3000`.
- All database credentials are managed automatically via `firebase-applet-config.json` and Google Cloud environments.
