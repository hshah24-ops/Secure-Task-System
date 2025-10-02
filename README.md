# Secure Task Management System (NX Monorepo)

A full-stack application for managing tasks securely using **Role-Based Access Control (RBAC)**, **JWT authentication**, and **organization-based scoping**.\


Built with **NestJS** (backend), **Angular** (frontend), and **PostgreSQL**.

---

## Features

- JWT-based Authentication & Authorization
- Role-Based Access Control (RBAC) with role inheritance
- Organization-based task scoping with recursive hierarchy
- Task CRUD (Create, View, Edit, Delete) with service-layer enforcement
- Audit Logging of all task actions (Owner/Admin only)
- User Management(Owners/Admins can create new users)
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

Create a `.env` file at the root based on `.env.example`:

```dotenv
# Database Config
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=changeme
DB_NAME=secure_task_manager

# JWT Config
JWT_SECRET=changeme
JWT_EXPIRY=3600s
```

### 4. Run PostgreSQL Database

Make sure PostgreSQL is running, then create the database:

```sql
CREATE DATABASE secure_task_manager;
```

### 5. Seed Initial Users

The backend comes with a **seeder script** for creating test users:

- `testuser_owner@example.com` → **Owner role**
- `testuser_viewer@example.com` → **Viewer role**

Run:

```bash
npm run seed
```

### 6. Build Auth Library (RBAC, Decorator, DTOs & Interfaces)

```bash
npx nx build auth
```

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

- **Separation of concerns**: backend and frontend are modular but share types and auth logic via `libs/`.
- **Shared logic**: DTOs, decorators, and guards reused across backend and frontend
- **Service-layer RBAC enforcement**: Guards check permissions, but services enforce business rules:

	--Task org scoping

	--Ownership checks

	--Audit logging

- This ensures defense in depth to have guards prevent unauthorized entry both at API and service-level protection
---

## Data Model

### Entities

- **User** – Belongs to an organization and has a role.
- **Role** – Defines permissions (Owner, Admin, Viewer).
- **Permission** – From libs/auth , for actions like `create_task`, `edit_task`, `delete_task`, `view_task`, `view_audit_log`, `create_user`, `view_user`.
- **Organization** – Groups users and tasks. Supports parent-child hierarchy
- **Task** – Belongs to an organization and is owned by a user.
- **AuditLog** – Records actions performed by users.

### AuditLog Fields
```ts
{
  id: number;
  userId: number;
  action: string;
  resourceId?: number;
  details?: string;
  timestamp: Date;
}
```
### ERD Diagram

```
Organization ───< User >─── Role >───< Permission
     │                          │
     └────────────< Task ───────┘
                      │
                   AuditLog   
```

---

## Access Control Implementation

### Roles & Permissions

| Role   | Permissions                                                       |
| ------ | ----------------------------------------------------------------- |
| Owner  | Create/Edit/Delete/View tasks, Create/View User, view\_audit\_log |
| Admin  | Create/Edit/Delete/View tasks, Create/View User, view\_audit\_log |
| Viewer | Only view tasks                                                   |

### Role Inheritance
```
Viewer < Admin < Owner
```

### Organization Hierarchy
- **Owner**: tasks in org + all child orgs (recursive)  
- **Admin**: tasks only in their own org  
- **Viewer**: view-only, limited to their own org  

### Service-Layer Enforcement
- **Tasks** → - **Tasks** → Owner/Admin sees org + child orgs (recursive), Viewer sees only own org (read-only)
- **Users** → Owners/Admins create users and view only in same org  
- **Audit Logs** → viewable by Owners/Admins only  

---

## JWT Authentication

Login issues a JWT containing:

```json
{
  "sub": 1,
  "email": "owner@example.com",
  "roleId": 1,
  "organizationId": 2,
  "permissions": [
    "view_task", "create_task", "update_task",
    "delete_task", "view_audit_log", "create_user", "view_user" 
  ]
}
```

- Angular stores JWT in `localStorage`  
- `AuthInterceptor` attaches JWT to all requests  
- Backend validates via `JwtStrategy`, user context available as `req.user` or `JwtPayload`

---

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

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

### Other API Endpoints for Tasks

| Method | Endpoint    | Description    | Permissions  |
| ------ | ----------- | -------------- | ------------ |
| GET    | /tasks/:id  | Get single task| view\_task   |
| GET    | /tasks      | List all tasks | view\_task   |
| POST   | /tasks      | Create task    | create\_task |
| PUT    | /tasks/:id  | Update task    | update\_task |
| DELETE | /tasks/:id  | Delete task    | delete\_task |

**Example GET /tasks Response:**

```json
[
  { "id": 1, "title": "Task 1", "description": "Take notes", "status": "Todo", "organizationId": 1, "createdById": 1  },
  { "id": 2, "title": "Task 2", "description": "Create meeting", "status": "Done", "organizationId": 2, "createdById": 5 }
]
```

### Users
| Method | Endpoint | Permissions |
|--------|----------|-------------|
| GET    | /users   | view_user   |
| POST   | /users   | create_user |

### Audit Log
**GET /audit-log** (Owner/Admin only)  
Response:
```json
[
  { "id": 1, "userId": 1, "action": "Created Task", "timestamp": "2025-09-30T12:00:00Z" }
]
```
---

## How Roles & Permissions Work

- Permissions are checked in `PermissionsGuard` using metadata from `@Permissions()`.

- Guard ensures:

  1. User has the required permission.
  2. Task belongs to the same organization as the user.

- Audit log actions are triggered in services whenever a user performs task operations.

---


## Users & Their Abilities

| User                                                                | Role   | Org | Abilities                  |
| ------------------------------------------------------------------- | ------ | --- | -------------------------- |
| [testuser\_viewer@example.com](mailto\:testuser_viewer@example.com) | Viewer | 1   | View tasks in Org 1 only   |
| [testuser\_owner@example.com](mailto\:testuser_owner@example.com)   | Owner  | 1   | Full access to Org 1 tasks |

---
## Screenshots

- Please see snippets of my project attached in the folder `Screenshots`.

## Future Considerations

- JWT refresh tokens for improved security
- CSRF protection for frontend requests
- Caching Role Permissions to optimize RBAC checks
- Delegated Role Management for enterprise use cases
- Scaling with microservices or GraphQL gateway

---



