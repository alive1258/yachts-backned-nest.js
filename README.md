<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<h1 align="center">🏥 Medico - Pharmaceutical E-Commerce Platform</h1>

<p align="center">
  <strong>A Production-Grade Pharmaceutical E-Commerce Backend API</strong><br/>
  Built with <a href="https://nestjs.com" target="_blank">NestJS</a>, TypeORM, PostgreSQL, and Redis
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/></a>
</p>

<p align="center">
  <strong>🔗 Live API:</strong> <a href="#">https://medico-e-commerce-backend-nest-js.onrender.com/api/v1</a><br/>
  <strong>📘 Swagger Docs:</strong> <a href="#">https://medico-e-commerce-backend-nest-js.onrender.com/api/v1/swagger</a>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Business Context](#-business-context)
- [Key Features](#-key-features)
- [Industry Standards](#-industry-standards)
- [Technical Architecture](#-technical-architecture)
- [Modules & Features](#-modules--features)
- [Database Design](#-database-design)
- [Security Implementation](#-security-implementation)
- [Performance Optimization](#-performance-optimization)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)

---

## 🎯 Overview

**Medico** is an enterprise-grade pharmaceutical e-commerce platform backend API designed to facilitate online medicine purchasing with prescription management, secure payment processing, and comprehensive order tracking.

This platform addresses the growing demand for **digital healthcare solutions** in Bangladesh and beyond, providing a seamless experience for customers, pharmacists, and administrators.

### 🌟 Business Value

- **Digital Healthcare Access:** Enable customers to order medicines online with prescription upload
- **Pharmacy Automation:** Streamline pharmacy operations with digital order management
- **Regulatory Compliance:** Built-in prescription validation and audit trails
- **Scalable Infrastructure:** Ready to handle thousands of concurrent users
- **Data-Driven Insights:** Comprehensive analytics for business intelligence

---

## 🏥 Business Context

### Target Users

| Role            | Description                    | Key Responsibilities                                                  |
| --------------- | ------------------------------ | --------------------------------------------------------------------- |
| **Customer**    | End-user purchasing medicines  | Browse products, upload prescriptions, place orders, track deliveries |
| **Pharmacist**  | Pharmacy staff managing orders | Verify prescriptions, process orders, manage inventory                |
| **Manager**     | Store/Operation manager        | Oversee operations, manage staff, handle escalations                  |
| **Admin**       | Super administrator            | System configuration, user management, audit oversight                |
| **Super Admin** | System owner                   | Full system access, platform governance                               |

### Business Workflows

Customer Journey:

-- Registration & Authentication

-- Browse/Search Medicines

-- Upload Prescription (if required)

-- Add to Cart & Checkout

-- Payment Processing

-- Order Tracking

-- Delivery & Feedback

Pharmacy Workflow:

-- Prescription Verification

-- Order Processing

-- Inventory Update

-- Dispatching & Delivery

-- Return/Refund Handling

---

## ⚡ Key Features

### 🛡️ Security & Authentication

- JWT-based authentication with refresh token rotation
- OTP verification for email/phone
- Role-based access control (RBAC)
- API key support for external integrations
- Secure HTTP-only cookie storage
- Rate limiting & throttling

### 📦 Product Management

- Multi-tier product categorization
- Generic & Brand management
- Prescription-required products
- Product variants (strength, dosage, pack size)
- Inventory management with stock tracking
- Product images & rich descriptions
- Manufacturer management
- Price history tracking

### 🛒 Shopping Experience

- Advanced search with filters (by category, generic, brand, price)
- Autocomplete suggestions
- Shopping cart management
- Wishlist functionality
- Product recommendations
- Similar products suggestion
- Rating & review system

### 📋 Order Management

- Complete order lifecycle tracking
- Order status workflow (Pending → Confirmed → Processing → Shipped → Delivered)
- Bulk order status updates
- Real-time order tracking
- Order timeline/history
- Order cancellation with reason

### 💳 Payment Integration

- Multiple payment methods (SSLCommerz, BKash, Nagad, Rocket)
- Payment status tracking
- Refund processing
- Payment reconciliation
- Secure transaction logging

### 📝 Prescription Management

- Prescription image upload
- Prescription verification workflow
- Admin approval/rejection system
- Prescription history tracking
- Compliance & audit trails

### 📊 Analytics & Reporting

- Sales analytics dashboard
- Product performance metrics
- Customer behavior analytics
- Order status statistics
- Revenue reports
- Inventory analytics

### 🔄 Audit & Compliance

- Comprehensive audit logging
- User action tracking
- Data modification history
- System activity monitoring
- GDPR/Data protection compliance

---

## 🏆 Industry Standards Implemented

### 1. **Security Standards**

| Standard                 | Implementation                                             |
| ------------------------ | ---------------------------------------------------------- |
| **OWASP Top 10**         | Input validation, SQL injection prevention, XSS protection |
| **JWT Security**         | Access/refresh token rotation, short-lived tokens          |
| **GDPR Compliance**      | Data anonymization, deletion, audit trails                 |
| **HIPAA Considerations** | Prescription data encryption, access controls              |
| **PCI DSS**              | Payment data handling, secure payment gateways             |

### 2. **API Design Standards**

| Standard        | Implementation                                  |
| --------------- | ----------------------------------------------- |
| **RESTful API** | Resource-based URLs, HTTP methods, status codes |
| **OpenAPI 3.0** | Complete Swagger documentation                  |
| **HATEOAS**     | Response links for resource navigation          |
| **JSON:API**    | Consistent response format                      |
| **Versioning**  | API version headers (v1, v2)                    |
| **Pagination**  | Offset/limit pagination with metadata           |

### 3. **Database Standards**

| Standard              | Implementation                            |
| --------------------- | ----------------------------------------- |
| **3NF Normalization** | Normalized database schema                |
| **ACID Compliance**   | Transaction support with rollback         |
| **Indexing Strategy** | Optimized indexes for performance         |
| **Soft Delete**       | `deleted_at` timestamp for data retention |
| **Audit Trails**      | All data modifications logged             |

### 4. **Code Quality Standards**

| Standard              | Implementation                        |
| --------------------- | ------------------------------------- |
| **SOLID Principles**  | Clean, maintainable code architecture |
| **Design Patterns**   | Repository, DTO, Factory, Singleton   |
| **TypeScript Strict** | Strict type checking                  |
| **ESLint/Prettier**   | Code formatting & linting             |
| **Unit Testing**      | Jest testing framework                |

### 5. **Performance Standards**

| Standard                  | Implementation                       |
| ------------------------- | ------------------------------------ |
| **Caching Strategy**      | Redis caching for frequent queries   |
| **Database Optimization** | Query optimization, batch processing |
| **Lazy Loading**          | Optimized relationship loading       |
| **Pagination**            | Avoid large data transfers           |
| **Batch Operations**      | Bulk updates for performance         |

---

## 🏗️ Technical Architecture

─────────────────────────────────────────────────────────────────┐
│ CLIENT LAYER │
│ (Web/Mobile Apps) │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ API GATEWAY LAYER │
│ (NestJS - JWT Auth, Rate Limiting) │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Auth │ │ Orders │ │Products │ │ Users │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Payments │ │ Cart │ │ Reviews │ │ Coupons │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ SERVICE LAYER │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Business Logic & Validation │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ DATA ACCESS LAYER │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │PostgreSQL│ │ Redis │ │ Search │ │ Queue │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────┘

---

## 📦 Modules & Features

### ✅ Completed Modules

| Module                      | Status      | Features                                  |
| --------------------------- | ----------- | ----------------------------------------- |
| **Authentication**          | ✅ Complete | JWT, OTP, RBAC, Password Recovery         |
| **Users Management**        | ✅ Complete | CRUD, Profile Management, Role Assignment |
| **Address Management**      | ✅ Complete | CRUD, Default Address                     |
| **Category Management**     | ✅ Complete | Nested Categories, Tree Structure         |
| **Generic Management**      | ✅ Complete | CRUD, Product Association                 |
| **Brand Management**        | ✅ Complete | CRUD, Product Association                 |
| **Manufacturer Management** | ✅ Complete | CRUD, Product Association                 |
| **Product Management**      | ✅ Complete | CRUD, Variants, Images, Details           |
| **Product Search**          | ✅ Complete | Advanced Filters, Autocomplete            |
| **Product Variants**        | ✅ Complete | Price, Stock, SKU Management              |
| **Product Images**          | ✅ Complete | Multiple Images, Sort Order               |
| **Related Products**        | ✅ Complete | Similar Products, Suggestions             |
| **Reviews & Ratings**       | ✅ Complete | CRUD, Approval, Helpful Count             |
| **Cart Management**         | ✅ Complete | Add/Remove, Quantity Update               |
| **Wishlist**                | ✅ Complete | Add/Remove Products                       |
| **Order Management**        | ✅ Complete | CRUD, Status Tracking                     |
| **Order Tracking**          | ✅ Complete | Status Timeline, History                  |
| **Order Items**             | ✅ Complete | Snapshot Data                             |
| **Payments**                | ✅ Complete | Payment Methods, Status                   |
| **Coupon System**           | ✅ Complete | CRUD, Validation, Application             |
| **Coupon Usage**            | ✅ Complete | Usage Tracking                            |
| **Prescription Upload**     | ✅ Complete | Upload, Verification                      |
| **Banner Management**       | ✅ Complete | CRUD, Positions                           |
| **Audit Logs**              | ✅ Complete | Full Activity Tracking                    |
| **Inventory Logs**          | ✅ Complete | Stock Movement Tracking                   |
| **Shipping**                | ✅ Complete | Delivery Zones, Tracking                  |

---

## 🗄️ Database Design

### Core Tables

Users & Authentication:
├── users
├── roles
├── user_roles
├── user_sessions
└── password_resets

Products & Catalog:
├── products
├── categories
├── generics
├── brands
├── manufacturers
├── product_variants
├── product_images
└── product_details

Shopping & Cart:
├── carts
├── cart_items
└── wishlists

Orders & Transactions:
├── orders
├── order_items
├── payments
├── order_tracking
└── shipping

Marketing & Promotions:
├── coupons
├── coupon_usages
└── banners

Compliance & Audit:
├── audit_logs
├── inventory_logs
└── prescriptions

### ER Diagram (High Level)

---

## 🔒 Security Implementation

### Authentication Flow

User Login → JWT Access/Refresh Tokens

HTTP-Only Cookie Storage

Token Validation on Each Request

Automatic Refresh on Expiry

Logout → Cookie Clearing

### Authorization Flow

Role-Based Access Control (RBAC)

Permission-Based Access

Resource Ownership Verification

Admin Override Capability

- `Clone the Repository:`

```js

git clone https://github.com/yourusername/medico-backend.git


```

- `Navigate to Project Directory:`

```js
cd medico-backend
```

- `Create a .env.example .env .env.development file in the root folder of the frontend project.`
- `Add the following environment variable`

```js
 NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

- `Install Dependencies::`

```js

npm install
```

- `Start Development Server:`

```js

npm run start:dev
```

License
This project is proprietary and confidential.

Copyright © 2024 Medico. All rights reserved.

Lead Developer Zamirul Kabir zamirulkabir999@gmail.com
