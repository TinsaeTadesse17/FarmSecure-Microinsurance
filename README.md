# 🌾FarmSecure-Microinsurance Platform

This project implements a comprehensive backend for a **FarmSecure-Microinsurance Platform** that supports crop and livestock insurance with configurable products, policy management, enrolment, claims processing, NDVI-based trigger evaluation, commission tracking, and more.

## 🚀 Project Overview

The platform provides RESTful APIs for:
- Managing insurance companies and branches
- Customer enrolment and policy generation
- Product and configuration setup
- Claims processing based on NDVI data
- Commission calculation and reporting
- Address and field-level geolocation mapping

---

## 🧱 Core Modules & Features

### 🔐 Authentication & User Roles
- Admin, Agent, and Customer roles
- Secure password handling and session management

### 🏢 Insurance Company Management
- Register and manage licensed insurance companies
- Company branches and associated addresses

### 📦 Products & Configurations
- Dynamic configuration for each product per zone and season
- Includes trigger/exit points, premium rates, and load factors

### 🌾 Field & Customer Management
- Field registration by geolocation
- Customers with banking and contact details

### 📜 Policy & Enrolment
- Enrol customers to products and generate policies
- Track periods and coverage

### ⚠️ Claims & NDVI Triggers
- Automatically evaluate NDVI thresholds for claims
- Handle claim processing with detailed payout logic

### 💸 Commissions & Rates
- Commission setup per company, branch, and product
- Detailed payment tracking with deductions and net payouts

---

## 🔧 Tech Stack

- **Backend:** FAST API
- **Database:** PostgreSQL
- **API:** REST
- **Authentication:** JWT 
- **Data Source:** NDVI and GIS data integration

---

## 📁 Directory Structure

```
📦 micro-insurance-platform
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── database/
├── .env
├── README.md
└── package.json
```

## Frontend Requirements

Below are the requirements and specifications for building the frontend application based on the existing backend services.

### Tech Stack
- React 18
- Next.js 13 (App Router)
- TypeScript
- HTTP Client: Axios (or Fetch API)
- State Management: React Context API (or Redux Toolkit)
- Styling: Tailwind CSS (or Material UI)
- Form Handling & Validation: React Hook Form with Yup

### Project Setup
- Node.js >= 14
- npm >= 6 or Yarn >= 1
- Environment Variables:
  - `NEXT_PUBLIC_API_BASE_URL`: Base URL of the backend API (e.g., `http://localhost:8000`)

### Pages and Routes
1. **Authentication**
   - `/login`: User login page (POST `/auth/login`)
   - `/register`: User registration page (POST `/auth/register`)
2. **Dashboard**
   - `/dashboard`: Overview of user activities and stats (GET `/dashboard`)
3. **Enrollments**
   - `/enrollments`: List all enrolments (GET `/enrollments`)
   - `/enrollments/new`: Create new enrolment (POST `/enrollments`)
   - `/enrollments/[id]`: View and manage a single enrolment (GET `/enrollments/{id}`)
     - Approve: PUT `/enrollments/{id}/approve`
     - Reject: PUT `/enrollments/{id}/reject`
4. **Claims Management**
   - `/claims`: List and file claims (GET `/claims`, POST `/claims`)
   - `/claims/[id]`: View and update claim status (GET/PUT)
5. **Insurance Companies**
   - `/companies`: List, create, and update companies (GET/POST/PUT)
6. **Policies & Products**
   - `/policies` & `/products`: CRUD operations as per backend schema
7. **Users & Roles**
   - `/users`: User management pages (list, create, edit)

### UI Components
- `Input`, `Select`, `DatePicker`, `Table`, `Modal`, `Button`, `Toast` / Notification
- Shared layout components: Header, Sidebar, Footer, Error Boundary

### Error Handling & Feedback
- Display validation errors inline using form libraries
- Show server/API errors via toast notifications or alert banners
- Implement global error boundary for unexpected exceptions

### Testing
- Jest & React Testing Library for unit and integration tests
- Cypress (optional) for end-to-end testing

### Scripts
```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Run production build
npm run lint       # Run ESLint
npm run test       # Run tests
```

