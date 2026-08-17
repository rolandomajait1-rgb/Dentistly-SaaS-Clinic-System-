# 🦷 Dental Appointment System - SaaS Platform

Multi-tenant dental appointment booking system with Facebook Messenger chatbot integration.

## ✨ Features

- 🏥 **Multi-tenant SaaS** - Support multiple dental clinics with isolated data
- 💬 **Facebook Messenger Bot** - Conversational appointment booking
- 📅 **Real-time Booking** - See available slots instantly
- 🎫 **Queue Management** - Organized patient flow
- 👥 **Staff Dashboard** - Manage appointments and patients
- 🔔 **Automated Notifications** - Reminders and updates
- 📊 **Analytics** - Track performance and revenue
- 💳 **Subscription Plans** - Flexible pricing tiers

## 🚀 Quick Start

### Prerequisites

- PHP 8.3+
- Composer
- MySQL/MariaDB
- Facebook Developer Account

### Installation

```bash
# 1. Install dependencies
composer install

# 2. Setup environment
copy .env.example .env
# Update .env with your database and Facebook credentials

# 3. Generate application key
php artisan key:generate

# 4. Create database
CREATE DATABASE dental_appointment;

# 5. Run migrations
php artisan migrate

# 6. Seed demo data
php artisan db:seed --class=DentalSystemSeeder

# 7. Start server
php artisan serve
```

Visit `http://localhost:8000`

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Step-by-step setup
- **[Backend Setup](BACKEND_SETUP_CHECKLIST.md)** - Complete verification
- **[Messenger Integration](MESSENGER_INTEGRATION_GUIDE.md)** - FB setup guide
- **[User & Staff Flows](USER_AND_STAFF_FLOW.md)** - Detailed workflows
- **[System Architecture](DENTAL_APPOINTMENT_SYSTEM_FLOWCHART.md)** - System design
- **[SaaS Features](SAAS_FEATURES_ADDITION.md)** - Multi-tenant features
- **[Cleanup Guide](CLEANUP_GUIDE.md)** - Remove old files

## 🏗️ Tech Stack

- **Backend:** Laravel 13, PHP 8.3
- **Database:** MySQL/MariaDB
- **Messaging:** Facebook Messenger Platform API
- **Frontend:** Vue.js (Coming Soon)
- **Queue:** Laravel Queue
- **Cache:** Redis (Optional)

## 📋 System Requirements

- PHP >= 8.3
- MySQL >= 8.0 or MariaDB >= 10.3
- Composer
- Node.js & NPM (for frontend)
- SSL Certificate (for production webhook)

## 🎯 Core Features

### For Patients (Messenger Bot)
- ✅ Conversational booking flow
- ✅ Service selection with prices
- ✅ Real-time calendar availability
- ✅ Date & time selection
- ✅ Patient information collection
- ✅ Booking confirmation
- ✅ View appointments
- ✅ View history
- ✅ Automated reminders

### For Staff (Dashboard - Coming Soon)
- ⏳ Approve/reject bookings
- ⏳ Manage daily schedule
- ⏳ Queue management
- ⏳ Patient records
- ⏳ Calendar management
- ⏳ Reports & analytics

### For Clinic Owners
- ⏳ Multi-branch support
- ⏳ Staff management
- ⏳ Service configuration
- ⏳ Subscription management
- ⏳ Custom branding

## 💳 Subscription Plans

| Plan | Price | Appointments | Staff | Features |
|------|-------|--------------|-------|----------|
| **Free Trial** | ₱0 (30 days) | 50/month | 1 | Basic booking, Messenger bot |
| **Basic** | ₱999/month | 200/month | 3 | + SMS notifications, Basic analytics |
| **Professional** | ₱1,999/month | Unlimited | 10 | + Email, Advanced analytics, Custom branding |
| **Enterprise** | ₱3,999/month | Unlimited | Unlimited | + Multi-branch, White-label, Priority support |

## 🧪 Testing

### Demo Credentials

After seeding, use these credentials:

```
Owner:  doctor@happysmiles.com / password
Staff:  staff@happysmiles.com / password
Doctor: doctor2@happysmiles.com / password
```

### Test Webhook

```bash
curl -X GET "http://localhost:8000/api/webhook/dental?hub.mode=subscribe&hub.verify_token=dental_appointment_webhook_token&hub.challenge=test123"
```

## 🔧 Configuration

### Environment Variables

```env
# Facebook Messenger
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=your_token
FACEBOOK_WEBHOOK_VERIFY_TOKEN=dental_appointment_webhook_token

# Database
DB_CONNECTION=mysql
DB_DATABASE=dental_appointment
DB_USERNAME=root
DB_PASSWORD=your_password

# Queue (for notifications)
QUEUE_CONNECTION=database
```

## 📊 Database Schema

- **tenants** - Multi-tenant support
- **clinics** - Clinic information
- **subscription_plans** - Available plans
- **subscriptions** - Clinic subscriptions
- **fb_page_integrations** - FB page connections
- **clinic_staff** - Staff accounts
- **dental_services** - Services offered
- **patients** - Patient records
- **appointments** - Appointment bookings
- **appointment_queue** - Queue management
- **calendar_slots** - Availability slots
- **chat_sessions** - Conversation state
- **notifications** - Notification queue
- **patient_history** - Medical records

## 🐛 Troubleshooting

### Common Issues

**Migration fails:**
```bash
php artisan migrate:fresh --seed
```

**Class not found:**
```bash
composer dump-autoload
```

**Routes not working:**
```bash
php artisan route:clear
php artisan config:clear
```

**Webhook not receiving:**
- Check URL is publicly accessible (use ngrok for local)
- Verify SSL certificate
- Check Facebook webhook subscriptions

## 🧹 Cleanup Old Files

If you have old loan system files, run:

```bash
# PowerShell
.\cleanup.ps1

# Or manually follow CLEANUP_GUIDE.md
```

## 🤝 Contributing

This is a capstone project. Contributions are welcome!

## 📝 License

MIT License

## 👥 Team

Capstone Project - Dental Appointment System

## 📞 Support

For issues or questions, check the documentation files or create an issue.

---

**Status:** ✅ Backend Complete | ⏳ Dashboard In Progress

**Last Updated:** May 18, 2026
