**Secure Task Management System (NX Monorepo)**

A full-stack application for **managing tasks securely** using **Role-Based Access Control (RBAC)** and **JWT authentication**.  
Built with **NestJS (backend)**, **Angular (frontend)**, and **PostgreSQL**.

**Features**

- **JWT-based Authentication**
- **Role-Based Access Control (RBAC)** with role inheritance
- **Organization-based task scoping**
- **Tasks CRUD (Create, View, Edit, Delete)** with permissions enforcement
- **Angular Dashboard** for managing tasks
- **NX Monorepo** for clean modular architecture
- **Audit Logging** of task actions

**Setup Instructions**

**1 Clone the Repository**

git clone <https://github.com/hshah24-ops/TurboVets_Assessment.git>

cd secure-task-management

**2 Install Dependencies**

npm install

**3 Setup Environment Variables**

Create a .env file at the root:

\# Database Config

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_NAME=secure_task_manager

\# JWT Secret

JWT_SECRET=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08

**4 Run PostgreSQL Database**

Make sure PostgreSQL is running, and create the database:

createdb secure_task_manager

**5 Run Backend (NestJS API)**

nx serve api

- Runs on: [**http://localhost:3000**](http://localhost:3000)

**6 Run Frontend (Angular Dashboard)**

nx serve dashboard

- Runs on: [**http://localhost:4200**](http://localhost:4200)

**Architecture Overview**

**NX Monorepo Structure**

apps/

├─ api/ # NestJS backend
└─ dashboard/ # Angular frontend
└─ auth/ # Shared RBAC logic & decorators

libs/
├─ data/ # Shared DTOs & interfaces

**Rationale**

- **Separation of concerns**: Backend and frontend are modular but share types and auth logic via libs/.
- **Scalable RBAC**: Permissions and role checks are centralized in guards and services.

**Data Model Explanation**

**Entities**

- **User**: Belongs to an organization and has a role.
- **Role**: Defines permissions (Owner, Admin, Viewer) and may inherit from a parent role.
- **Permission**: Defines actions (create_task, edit_task, delete_task, view_task).
- **Organization**: Groups users and tasks.
- **Task**: Belongs to an organization and is owned by a user.
- **AuditLog**: Records actions performed by users.

**ERD Diagram**

Organization ───&lt; User &gt;─── Role >───< Permission
│                                   │
└─────────────────────< Task ───────┘

**Access Control Implementation**

**Roles & Permissions**

| **Role** | **Permissions** |
| --- | --- |
| **Owner** | All permissions |
| **Admin** | Create, Edit, Delete, View tasks |
| **Viewer** | Only View tasks |

**Role Inheritance**

- Viewer < Admin < Owner
- A role inherits permissions from its parent role.

**Organization Hierarchy**

- Users can only manage tasks within their organization.
- Even if a user has permissions, they are **restricted to tasks of their org**.

**JWT Authentication**

- Upon login, a JWT is issued containing { userId, email, roleId, organizationId }.
- Angular stores the JWT in **localStorage** and attaches it to all API requests via **AuthInterceptor**.
- Backend validates the JWT in every request using **JwtStrategy** and populates req.user.

**API Documentation**

**Base URL**
<http://localhost:3000/api>

**Endpoints**

** Authentication**

- POST /auth/login

Request:

{ "email": "<test@example.com>", "password": "password" }

Response:

{ "access_token": "jwt_token" }

**Tasks**

| **Method** | **Endpoint** | **Permissions** |
| --- | --- | --- |
| GET | /tasks | view_task |
| POST | /tasks | create_task |
| PUT | /tasks/:id | edit_task |
| DELETE | /tasks/:id | delete_task |


**Example Response: GET /tasks**

\[
{ "id": 1, "title": "Task 1", "status": "Todo", "organizationId": 1 },

{ "id": 2, "title": "Task 2", "status": "Done", "organizationId": 1 }
\]

**Audit Log**

- GET /audit-log – Owners/Admins only

**How Roles & Permissions Work**

- Permissions are checked in **PermissionsGuard** using metadata from @Permissions().
- Guard ensures:
    1. User has the required permission.
    2. The task belongs to the same organization as the user.

**Testing Strategy**

- **Backend**: Jest tests for RBAC guards, authentication, and task endpoints.
- **Frontend**: Karma/Jest tests for components and state logic.  
    

**Future Considerations**

- **JWT Refresh Tokens** for better security.
- **CSRF Protection** for frontend requests.
- **Caching Role Permissions** to optimize RBAC checks.
- **Delegated Role Management** for enterprise use cases.
- **Scaling** with microservices or GraphQL gateway.

**Users & Their Abilities**

| **User** | **Role** | **Org** | **Abilities** |
| --- | --- | --- | --- |
| test@example | Viewer | 1   | View only tasks in Org 1 |
| viewer@example | Viewer | 2   | View only tasks in Org 2 |
| seed@example | Owner | 2   | Full access to Org 2 tasks |
