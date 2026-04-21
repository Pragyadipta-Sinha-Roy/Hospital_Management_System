# Business Operations Management System

A complete end-to-end full-stack web application built with **Spring Boot**, **React (Vite)**, and **MySQL** for managing:
- Product catalog
- Customer profiles
- Order placement and lifecycle
- Billing and invoice generation

## Tech Stack

- Backend: Java 17, Spring Boot 3, Spring Security, JWT, Spring Data JPA, Bean Validation
- Frontend: React 18, React Router, Axios, Bootstrap 5
- Database: MySQL 8
- Testing: JUnit 5, Mockito
- Deployment helpers: Docker Compose (MySQL)

## Project Structure

- `backend/` – REST API, domain logic, auth/security, persistence
- `frontend/` – React SPA with routing and role-based UI
- `database/schema.sql` – reference schema notes
- `docker-compose.yml` – MySQL service

## Core Features

- JWT authentication (`/api/auth/register`, `/api/auth/login`)
- Role-based access control (`ADMIN`, `STAFF`, `CUSTOMER`)
- Product CRUD (admin) + product browsing/search/filter (public)
- Customer self profile management
- Customer order checkout with stock validation
- Automatic invoice generation with tax and due date
- Centralized validation and error responses
- Caching for product queries
- Seed data (admin, staff, sample products)

## Default Accounts

Created automatically on first backend startup:

- Admin: `admin` / `Admin#12345`
- Staff: `staff` / `Staff#12345`

Customers should register via UI.

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- npm 9+
- Docker (optional, for MySQL)

## 1) Start MySQL

From the project root:

```powershell
docker compose up -d
```

MySQL runs on `localhost:3306` with:
- DB: `hospital_business`
- user: `root`
- password: `root`

## 2) Run Backend

```powershell
cd "C:\Users\KIIT0001\OneDrive\Desktop\hospital-management-system\backend"
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

## 3) Run Frontend

```powershell
cd "C:\Users\KIIT0001\OneDrive\Desktop\hospital-management-system\frontend"
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Products
- `GET /api/products?q=&category=` (public)
- `GET /api/products/{id}` (public)
- `POST /api/products` (admin)
- `PUT /api/products/{id}` (admin)
- `DELETE /api/products/{id}` (admin)

### Customers
- `GET /api/customers/me`
- `PUT /api/customers/me` (customer)
- `GET /api/customers` (admin/staff)

### Orders
- `GET /api/orders`
- `GET /api/orders/{id}`
- `POST /api/orders` (customer)
- `PATCH /api/orders/{id}/status` (admin/staff)

### Invoices
- `GET /api/invoices`
- `GET /api/invoices/{id}`

## Testing

Backend tests:

```powershell
cd "C:\Users\KIIT0001\OneDrive\Desktop\hospital-management-system\backend"
mvn test
```

Frontend production build test:

```powershell
cd "C:\Users\KIIT0001\OneDrive\Desktop\hospital-management-system\frontend"
npm run build
```

## Deployment Notes

- Set strong production values for `app.jwt.secret` and database credentials.
- Configure reverse proxy (Nginx/Apache) for frontend static hosting + backend API routing.
- Move `spring.jpa.hibernate.ddl-auto` to safer strategy for production (`validate` or controlled migrations).
- Prefer CI/CD with GitHub Actions for test/build/deploy pipelines.

## Suggested Next Enhancements

- Redis cache
- Payment gateway integration
- Advanced analytics/reporting dashboards
- OpenAPI/Swagger documentation
- Database migrations via Flyway/Liquibase
