<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<h1 align="center">⛵ Sustainable Yachts — Backend API</h1>

<p align="center">
  <strong>A Yacht Charter Booking & Content Platform Backend API</strong><br/>
  Built with <a href="https://nestjs.com" target="_blank">NestJS</a>, TypeORM, PostgreSQL, and Stripe
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe"/></a>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Booking & Payment Flow](#-booking--payment-flow)
- [Modules](#-modules)
- [Security Implementation](#-security-implementation)
- [Getting Started](#-getting-started)

---

## 🎯 Overview

**Sustainable Yachts** is the backend API for a yacht charter marketing site and booking platform — public content (fleet, destinations, experiences, portfolio, sustainability story, blog) plus an authenticated booking and Stripe deposit/balance payment flow, and an admin dashboard for managing all of it.

---

## ⚡ Key Features

### 🛡️ Security & Authentication

- JWT-based authentication (access + refresh tokens as HTTP-only cookies)
- Mandatory OTP verification on sign-up and every sign-in
- Role/permission-based access control (RBAC), with a seeded Super Admin
- API key support for external/service integrations
- Rate limiting & throttling on sensitive routes

### 🚤 Yacht Charter Booking

- Yacht fleet catalog (specs, pricing, gallery, amenities)
- Booking requests with date-overlap prevention and per-yacht capacity checks
- Pricing snapshot at booking time (rate changes don't retroactively affect existing bookings)
- 30% deposit / balance payment split

### 💳 Stripe Payments

- Stripe Checkout Sessions for deposit and balance payments
- Signature-verified webhook reconciliation (`checkout.session.completed` / `.expired`)
- Payment history per booking, per user, and admin-wide

### 📝 Content & Marketing

- Destinations, Experiences, Portfolio, Events
- Sustainability story (intro, pillars, roadmap)
- About (story, stats, explore), Services, Hero
- Blog & categories, Testimonials, Video galleries, FAQ (Question & Answers)
- Configurable dashboard navigation menu

---

## 🔁 Booking & Payment Flow

1. Guest submits a booking request for a yacht and date range (`POST /bookings`) — rejected if it overlaps an existing pending/confirmed booking or exceeds guest capacity.
2. Guest starts a Stripe Checkout session for the 30% deposit (`POST /payments/checkout-session`, `type: "deposit"`).
3. Stripe redirects to `FRONTEND_URL/booking/confirmation` (or `/booking/cancelled`) after checkout.
4. Stripe calls `POST /payments/webhook`; the signature is verified and the matching `Payment`/`Booking` rows are reconciled — booking moves to `confirmed` / `deposit_paid`.
5. Once the deposit has cleared, the guest can pay the remaining balance the same way (`type: "balance"`).

---

## 📦 Modules

| Domain            | Modules                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **Auth & Access**   | `auth`, `users`, `roles`                                                                 |
| **Booking & Pay**   | `yachts`, `bookings`, `payments`                                                          |
| **Content**         | `destinations`, `experiences`, `portfolio`, `events`, `services`, `hero`                 |
| **Sustainability**  | `sustainability`, `sustainability-intro`, `sustainability-pillars`, `sustainability-roadmap`, `life-aboard-photos`, `innovation-concepts` |
| **About**           | `about`, `about-story`, `about-stats`, `about-explore`, `employees`                       |
| **Marketing**       | `blog`, `blog-category`, `blog-details`, `testimonials`, `client-video-reviews`, `video-gallaries`, `video-gallary-categories`, `gallery`, `question-answers` |
| **Platform**        | `menu`, `mail`                                                                            |

---

## 🔒 Security Implementation

- **Authentication:** sign-up/sign-in → OTP email → JWT access + refresh tokens set as HTTP-only, `Secure`, `SameSite=None` cookies.
- **Authorization:** role/permission matrix checked per-route via `PermissionsGuard`; Super Admin bypasses permission checks.
- **Payments:** Stripe secret key never touches the client; webhook signature is verified against `Webhook_secret` before any reconciliation.
- **Headers:** `helmet()` + `compression()` applied globally; CORS restricted to an explicit origin allowlist.

---

## 🚀 Getting Started

```bash
git clone https://github.com/alive1258/yachts-backned-nest.js.git
cd yachts-backned-nest.js

npm install

# Create .env.development (and .env for production) from .env.example,
# then set at minimum: DATABASE_URL, JWT secrets, Secret_key (Stripe),
# Webhook_secret (Stripe), FRONTEND_URL, MAIL_HOST/SMTP credentials.

npm run start:dev
```

API available at `http://localhost:5000/api/v1`, Swagger docs at `http://localhost:5000/api/v1/swagger`.

---

## License

This project is proprietary and confidential.

Copyright © 2026 Sustainable Yachts. All rights reserved.

Lead Developer: Zamirul Kabir — zamirulkabir999@gmail.com
