# 🌾Agteck Micro Insurance Platform

This project implements a comprehensive backend for a **Agteck Micro Insurance Platform** that supports crop and livestock insurance with configurable products, policy management, enrolment, claims processing, NDVI-based trigger evaluation, commission tracking, and more.

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

