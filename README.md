# 🦷 Dental Clinic SaaS Platform (Pivodent)

Welcome to the **Dental Clinic SaaS Platform**, a modern, high-fidelity software-as-a-service application designed to streamline operations, manage appointments, and optimize workflows for modern dental practices.

## 🚀 Key Features

- **Multi-Tenant Architecture**: Robust tenant separation and custom subscription-tier configurations.
- **AI Chatbot Q&A Integration**: Automated patient response and booking agent via Wit.ai/Facebook Messenger.
- **Smart Appointment Scheduler**: Advanced calendar management with real-time queue status and Google Calendar sync.
- **HIPAA Compliant Security**: Secure storage, encrypted communication, and role-based staff permissions.
- **High-Fidelity Dashboard & Landing Page**: Stunning user interfaces featuring sleek glassmorphism, responsive designs, and smooth animations.

---

## 📁 Repository Structure

```text
dental-clinic-system/
├── backend/            # Laravel 11.x API & Services
│   ├── app/            # Models, Controllers, and Services
│   ├── config/         # System configurations
│   ├── database/       # Migrations & Seeders
│   └── routes/         # API webhook and endpoint routing
├── frontend/           # Vite + React SPA Client
│   ├── src/            # Components, Pages, and Hooks
│   └── public/         # Static assets and media
└── docs/               # Technical documentation & Figma spec sheets
```

---

## 🛠️ Local Development Setup

### Prerequisites

- **PHP 8.2+** & **Composer**
- **Node.js 18+** & **npm**
- **MySQL** (or equivalent database)

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy the environment variables template and configure your connection:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   composer install
   ```
4. Run migrations and seed the database:
   ```bash
   php artisan migrate:fresh --seed
   ```
5. Start the development server:
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

---

## ⚙️ Integrations & Automation

- **SMS Gateway**: Semantic notification dispatching.
- **Email Server**: Custom mailer drivers configured per clinic tenant.
- **Facebook Messenger Webhook**: Handled dynamically through `DentalWebhookController`.
- **Google Calendar OAuth**: Dynamic resource synchronization.

---

*Version: 2.4.0 • Built with Laravel & React*
