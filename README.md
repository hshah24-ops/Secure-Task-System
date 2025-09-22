# Secure Task Management System (NX Monorepo)

A full-stack application for managing tasks securely using **Role-Based Access Control (RBAC)** and **JWT authentication**.\


Built with **NestJS** (backend), **Angular** (frontend), and **PostgreSQL**.

---

## Features

- JWT-based Authentication
- Role-Based Access Control (RBAC) with role inheritance
- Organization-based task scoping
- Task CRUD (Create, View, Edit, Delete) with permissions enforcement
- Audit Logging of all task actions (Owner/Admin can view)
- Angular Dashboard for managing tasks
- NX Monorepo for modular, scalable architecture
- Database seeding for initial users and roles



---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/hshah24-ops/Secure-Task-System.git
cd secure-task-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file at the root:

```dotenv
# Database Config
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_NAME=secure_task_manager
```

### 4. Run PostgreSQL Database

Make sure PostgreSQL is running, then create the database:

```sql
CREATE DATABASE secure_task_manager;
```

### 5. Seed Initial Users

The backend comes with a **seeder script** for creating test users:

- `testuser_owner@example.com` → Owner role
- `testuser_viewer@example.com` → Viewer role

Run:

```bash
npm run seed
```

### 6. Run Auth (RBAC, Decorator, DTOs & Interfaces)

npx nx build auth

### &#x20;

### 7. Run Backend (NestJS API)

```bash
nx serve api
```

- Runs on: `http://localhost:3000`

### 8. Run Frontend (Angular Dashboard)

```bash
nx serve dashboard
```

- Runs on: `http://localhost:4200`

---

## Architecture Overview

### NX Monorepo Structure

```
apps/
 ├─ api/          # NestJS backend
 └─ dashboard/    # Angular frontend

libs/
 ├─ auth/         # Shared RBAC logic & decorators, and DTOs & Interfaces
```

### Rationale

- Separation of concerns: backend and frontend are modular but share types and auth logic via `libs/`.
- Scalable RBAC: permissions and role checks are centralized in guards and services.
- Audit logging ensures traceability for task actions.

---

## Data Model

### Entities

- **User** – Belongs to an organization and has a role.
- **Role** – Defines permissions (Owner, Admin, Viewer) and may inherit from a parent role.
- **Permission** – From libs/auth , for actions like `create_task`, `edit_task`, `delete_task`, `view_task`, `view_audit_log`.
- **Organization** – Groups users and tasks.
- **Task** – Belongs to an organization and is owned by a user.
- **AuditLog** – Records actions performed by users.

### ERD Diagram

```
Organization ───< User >─── Role >───< Permission
     │                          │
     └────────────< Task ───────┘
```

---

## Access Control Implementation

### Roles & Permissions

| Role   | Permissions                                     |
| ------ | ----------------------------------------------- |
| Owner  | All permissions including view\_audit\_log      |
| Admin  | Create/Edit/Delete/View tasks, view\_audit\_log |
| Viewer | Only view tasks                                 |

### Role Inheritance

- `Viewer < Admin < Owner`
- A role inherits permissions from its parent role.

### Organization Hierarchy

- Users can only manage tasks within their organization.
- Even if a user has permissions, they cannot access tasks outside their org.

---

## JWT Authentication

- Upon login, a JWT is issued containing:

```json
{ "userId": 1, "email": "test@example.com", "roleId": 2, "organizationId": 1 }
```

- Angular stores the JWT in `localStorage` and attaches it to all API requests via `AuthInterceptor`.
- Backend validates the JWT in every request using `JwtStrategy` and populates `req.user`.

---

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### 🔑 Authentication

**POST /auth/login**

**Request:**

```json
{
  "email": "viewer@example.com",
  "password": "viewer123"
}
```

**Response:**

```json
{
  "access_token": "jwt_token_here"
}
```

---

### 📌 Other API Endpoints for Tasks

| Method | Endpoint  | Permissions  |
| ------ | --------- | ------------ |
| GET    | /tasks    | view\_task   |
| POST   | /tasks    | create\_task |
| PUT    | /tasks/id | edit\_task   |
| DELETE | /tasks/id | delete\_task |

**Example GET /tasks Response:**

```json
[
  { "id": 1, "title": "Task 1", "status": "Todo", "organizationId": 1 },
  { "id": 2, "title": "Task 2", "status": "Done", "organizationId": 1 }
]
```

---

### Audit Log

- **GET /audit-log** – Only accessible to **Owner/Admin**
- Records all CRUD actions on tasks with `userId`, `action`, and `timestamp`.

---

## How Roles & Permissions Work

- Permissions are checked in `PermissionsGuard` using metadata from `@Permissions()`.

- Guard ensures:

  1. User has the required permission.
  2. Task belongs to the same organization as the user.

- Audit log actions are triggered in services whenever a user performs task operations.

---

---

## Users & Their Abilities

| User                                                                | Role   | Org | Abilities                  |
| ------------------------------------------------------------------- | ------ | --- | -------------------------- |
| [testuser\_viewer@example.com](mailto\:testuser_viewer@example.com) | Viewer | 1   | View tasks in Org 1 only   |
| [testuser\_owner@example.com](mailto\:testuser_owner@example.com)   | Owner  | 1   | Full access to Org 1 tasks |

---

## Future Considerations

- JWT refresh tokens for improved security
- CSRF protection for frontend requests
- Caching Role Permissions to optimize RBAC checks
- Delegated Role Management for enterprise use cases
- Scaling with microservices or GraphQL gateway

---



