# TRUX Logistics Management System

TRUX is a logistics management platform built with Next.js, React, Prisma, and PostgreSQL. It connects customers, companies, drivers, and administrators through role-based dashboards for shipment creation, quotation review, driver assignment, trip tracking, and operational reporting.

## Table of Contents

- [Overview](#overview)
- [Main Features](#main-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Database Workflow](#database-workflow)
- [Application Routes](#application-routes)
- [API Reference](#api-reference)
- [Roles and Permissions](#roles-and-permissions)
- [Shipment Lifecycle](#shipment-lifecycle)
- [Example Request](#example-request)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Development Notes](#development-notes)

## Overview

The application provides a multi-role logistics workflow:

- Customers and companies create shipment requests.
- Administrators review proposed prices and manage users.
- Administrators assign available drivers to approved shipments.
- Drivers update trip progress from assigned work to final delivery.
- Dashboards display shipment history, active operations, and PDF reporting actions.

## Main Features

- JWT-based authentication with access and refresh tokens.
- Role-based access control for admin, company, customer, and driver users.
- User directory with create, edit, activate, and deactivate flows.
- Shipment request creation with basic quote calculation.
- Quotation review workflow for proposed shipment prices.
- Driver assignment and shipment status updates.
- PDF report generation through `jspdf` and `jspdf-autotable`.
- Prisma schema and migrations for PostgreSQL.

## Tech Stack

- Next.js `16.2.3`
- React `19.2.4`
- TypeScript
- Prisma `7.x`
- PostgreSQL
- Bun
- Tailwind CSS `4`
- Jose for JWT handling
- bcryptjs for password hashing
- SweetAlert2 for user feedback

## Project Structure

```text
src/
  app/
    api/              API route handlers
    (auth)/           Login and register pages
    (dashboard)/      Role-based dashboard pages
  components/
    shipments/        Shipment modal components
    ui/               Dashboard and shared UI components
    users/            User management modal
  lib/                Database, JWT, auth, and hashing helpers
  services/           Business logic services
  types/              Shared TypeScript types
prisma/
  migrations/         Database migrations
  schema.prisma       Prisma data model
public/               Static assets
```

## Prerequisites

- Bun installed locally.
- Node.js `18` or newer.
- PostgreSQL database, local or hosted.
- Git.

## Environment Variables

Create a `.env` file in the project root:

```env
# Authentication
JWT_ACCESS_SECRET="replace-with-a-secure-access-secret"
JWT_REFRESH_SECRET="replace-with-a-secure-refresh-secret"
NEXTAUTH_SECRET="replace-with-a-secure-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_SECRET_CODE="replace-with-your-admin-registration-code"

# Database
DATABASE_URL="postgresql://user:password@host:6543/postgres"
DIRECT_URL="postgresql://user:password@host:5432/postgres"
```

Use strong secrets in production. Do not commit real `.env` values.

## Installation

```bash
bun install
```

Generate the Prisma client:

```bash
bunx prisma generate --schema=prisma/schema.prisma
```

Run the development server:

```bash
bun run dev
```

Open the app at:

```text
http://localhost:3000
```

## Available Scripts

```bash
bun run dev
```

Starts the Next.js development server.

```bash
bun run build
```

Generates the Prisma client and builds the Next.js application.

```bash
bun run start
```

Starts the production server after a successful build.

```bash
bun run lint
```

Runs ESLint.

## Database Workflow

Generate the Prisma client:

```bash
bunx prisma generate --schema=prisma/schema.prisma
```

Apply migrations in development:

```bash
bunx prisma migrate dev --schema=prisma/schema.prisma
```

Open Prisma Studio:

```bash
bunx prisma studio --schema=prisma/schema.prisma
```

## Application Routes

- `/login`: User login.
- `/register`: User registration.
- `/masterAdmin`: Admin dashboard and user directory.
- `/quotation`: Admin quotation review.
- `/shipments`: Shipment assignment workspace.
- `/company`: Company dashboard.
- `/customer`: Customer dashboard.
- `/driver`: Driver dashboard.

## API Reference

### Authentication

- `POST /api/auth/register`: Creates a new user account.
- `POST /api/auth/login`: Authenticates a user and returns session data.
- `POST /api/auth/refresh`: Refreshes the access token.
- `POST /api/auth/logout`: Clears session cookies.

### Users

- `GET /api/users`: Lists users. Admin only.
- `POST /api/users`: Creates a user from the admin dashboard.
- `PATCH /api/users/[id]`: Updates user details or active status. Admin only.

### Shipments

- `GET /api/shipments`: Lists shipments based on the authenticated role.
- `POST /api/shipments`: Creates a shipment request. Customer or company only.
- `PATCH /api/shipments/[id]`: Updates shipment status, assigns a driver, or rejects a shipment.

### Agents

- `POST /api/agents/create`: Creates an agent record. Admin write access is enforced by the proxy.

## Roles and Permissions

- `ADMIN`: Manages users, reviews quotations, assigns drivers, and can view all shipments.
- `COMPANY`: Creates and tracks company shipments.
- `CUSTOMER`: Creates and tracks personal shipment requests.
- `DRIVER`: Views assigned shipments and updates trip progress.

## Shipment Lifecycle

The current schema supports these shipment statuses:

- `PENDING`
- `PENDING_SUPERADMIN_REVIEW`
- `PENDING_FOR_PAY`
- `AVAILABLE_FOR_ASSIGNMENT`
- `ASSIGNED`
- `IN_TRANSIT`
- `DELIVERED`
- `CANCELLED`
- `REJECTED`

Typical flow:

1. A customer or company creates a shipment request.
2. The request waits for admin quotation review.
3. The shipment becomes available for assignment after approval.
4. An admin assigns a driver.
5. The driver moves the shipment to `IN_TRANSIT`.
6. The driver completes the shipment as `DELIVERED`.

## Example Request

Create a shipment:

```http
POST /api/shipments
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "cargoType": "Industrial Machinery",
  "weight": 5.5,
  "dimensions": "2m x 2m x 3m",
  "origin": "Port of Houston, TX",
  "destination": "Warehouse 7, Chicago, IL",
  "timeline": "URGENT",
  "proposedPrice": 2750
}
```

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ SHIPMENT : sends
    USER ||--o{ SHIPMENT : drives
    USER ||--o{ COMPANY : manages
    COMPANY ||--o{ USER : includes
    COMPANY ||--o{ SHIPMENT : owns
    USER ||--o{ DRIVER_APPLICATION : submits

    USER {
        int id PK
        string name
        string email UK
        string nit UK
        string address
        string phone
        string password
        enum role
        boolean isActive
        datetime createdAt
        int companyId FK
    }

    COMPANY {
        int id PK
        string name
        string nit UK
        string address
        boolean isActive
        int managerId FK
        datetime createdAt
    }

    SHIPMENT {
        int id PK
        string cargoType
        float weight
        string dimensions
        string origin
        string destination
        string timeline
        enum status
        int senderId FK
        int driverId FK
        int companyId FK
        decimal proposedPrice
        decimal approvedPrice
        enum paymentStatus
        datetime createdAt
        datetime updatedAt
    }

    DRIVER_APPLICATION {
        int id PK
        int userId FK
        enum status
        int reviewedById FK
        string notes
        datetime createdAt
        datetime reviewedAt
    }
```

## Development Notes

- The project uses a generated Prisma client at `src/generated/prisma`.
- `src/proxy.ts` protects dashboard pages and selected API routes.
- Authentication data is currently used through cookies and local storage in the UI.
- Keep component comments in English so the codebase remains consistent.
- Prefer one package manager for repeatable installs. The scripts are currently Bun-oriented.

--------------------------
**CUENTAS PARA INICIAR SESIÓN**
*email: admin@trux.com
*password: admin



