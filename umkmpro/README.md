# 🚀 UMKMPRO - Platform Super-App untuk UMKM

## Deskripsi
UMKMPRO adalah platform all-in-one operating system untuk UMKM di Indonesia yang mengintegrasikan:
- 💰 Manajemen Keuangan (Accounting, Cash Flow, P&L)
- 📦 Manajemen Inventory & Produk
- 👥 CRM & Customer Management
- 📊 Analytics & Business Intelligence
- 🤖 AI Business Assistant

## Tech Stack

### Backend
- **API Gateway**: Node.js + Express + TypeScript
- **Microservices**: Node.js + TypeScript
- **AI Service**: Python + FastAPI
- **Database**: PostgreSQL 15, Redis, TimescaleDB, MongoDB
- **Message Queue**: RabbitMQ
- **Authentication**: JWT + OAuth2

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts + Chart.js
- **Forms**: React Hook Form + Zod

### Infrastructure
- **Container**: Docker + Docker Compose
- **API Documentation**: Swagger/OpenAPI
- **Monitoring**: Prometheus + Grafana (optional)

## Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+ (atau gunakan Docker)
- Redis (atau gunakan Docker)

## Quick Start

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# AI Service
cd backend/apps/ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 2. Setup Environment Variables

```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit dengan konfigurasi Anda
```

### 3. Setup Database

```bash
# Start PostgreSQL dengan Docker
docker-compose up -d postgres redis

# Run migrations
cd backend
npm run migrate
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend API Gateway
cd backend/apps/api-gateway
npm run dev

# Terminal 2 - Finance Service
cd backend/apps/finance-service
npm run dev

# Terminal 3 - AI Service
cd backend/apps/ai-service
uvicorn app.main:app --reload --port 8001

# Terminal 4 - Frontend
cd frontend
npm run dev
```

### 5. Akses Aplikasi

- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- API Docs: http://localhost:4000/api-docs
- AI Service: http://localhost:8001/docs

## Docker Development (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Project Structure

```
umkmpro/
├── backend/
│   ├── apps/                    # Microservices
│   │   ├── api-gateway/
│   │   ├── auth-service/
│   │   ├── finance-service/
│   │   ├── inventory-service/
│   │   ├── crm-service/
│   │   ├── analytics-service/
│   │   ├── ai-service/          # Python FastAPI
│   │   └── notification-service/
│   ├── packages/                # Shared packages
│   │   ├── database/
│   │   ├── types/
│   │   ├── utils/
│   │   └── config/
│   └── scripts/
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   └── public/
├── database/
│   ├── migrations/
│   └── seeds/
└── docs/
```

## Default Test Accounts

```
Email: demo@umkmpro.com
Password: Demo123!

Email: owner@tokoberkah.com
Password: Owner123!
```

## Features

### ✅ Implemented
- [x] Authentication & Authorization (JWT)
- [x] Business Management
- [x] Product & Inventory Management
- [x] Sales Transaction (POS)
- [x] Customer Management (CRM)
- [x] Expense Tracking
- [x] Debt Management
- [x] Financial Reports (P&L, Cash Flow)
- [x] Analytics Dashboard
- [x] AI Business Assistant
- [x] Low Stock Notifications
- [x] Daily Sales Summary

### 🚧 Roadmap
- [ ] Mobile App (React Native)
- [ ] WhatsApp Integration
- [ ] Payment Gateway Integration
- [ ] Multi-Branch Support
- [ ] Employee Management & Payroll
- [ ] Purchase Orders
- [ ] Barcode Printing
- [ ] Advanced ML Predictions

## API Documentation

Setelah menjalankan backend, akses dokumentasi API di:
- Swagger UI: `http://localhost:4000/api-docs`
- ReDoc: `http://localhost:4000/api-redoc`

## Testing

```bash
# Backend unit tests
cd backend
npm test

# Integration tests
npm run test:integration

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## Deployment

### Production Build

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

Proprietary - © 2025 UMKMPRO

## Support

- Documentation: https://docs.umkmpro.com
- Email: support@umkmpro.com
- WhatsApp: +62 812-3456-7890

## Acknowledgments

- Anthropic Claude untuk AI Assistant
- Komunitas UMKM Indonesia
- Open source contributors

---

Built with ❤️ for Indonesian SMEs
