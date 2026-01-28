# 🚀 UMKMPRO - Quick Start Guide

## ⚡ Fastest Way to Run (Docker - Recommended)

### Step 1: Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your favorite editor
# MUST CHANGE: JWT_SECRET (use random 32+ characters)
nano .env
```

### Step 2: Start Everything
```bash
# Start all services (this will take 2-3 minutes first time)
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Check logs
docker-compose logs -f
```

### Step 3: Initialize Database
```bash
# The database is automatically initialized by init.sql
# No manual migration needed!
```

### Step 4: Access Application
Open your browser:
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **API Gateway**: http://localhost:4000/health
- 📚 **AI Service Docs**: http://localhost:8001/docs

## 🛠️ Manual Development Setup

### Prerequisites Check
```bash
node --version  # Should be 20+
python --version  # Should be 3.11+
docker --version
```

### Backend Setup
```bash
cd backend

# Install root dependencies
npm install

# Install service dependencies (monorepo)
npm install --workspaces

# Start services individually (open multiple terminals)
# Terminal 1
cd apps/api-gateway && npm run dev

# Terminal 2  
cd apps/auth-service && npm run dev

# Terminal 3
cd apps/finance-service && npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### AI Service Setup
```bash
cd backend/apps/ai-service

python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## 🧪 Test the Installation

### 1. Check API Gateway
```bash
curl http://localhost:4000/health
# Expected: {"status":"ok","service":"api-gateway"}
```

### 2. Check Auth Service
```bash
curl http://localhost:4001/health  
# Expected: {"status":"ok","service":"auth-service"}
```

### 3. Test Registration
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User"
  }'
```

### 4. Open Frontend
Navigate to http://localhost:3000 - you should see the UMKMPRO homepage!

## 📂 Project Structure Overview

```
umkmpro/
├── backend/
│   ├── apps/                    # All microservices
│   │   ├── api-gateway/         # Main entry point (:4000)
│   │   ├── auth-service/        # Authentication (:4001)
│   │   ├── finance-service/     # Transactions (:4002)
│   │   └── ai-service/          # AI Assistant (:8001)
│   └── packages/                # Shared code
│       ├── database/            # DB clients
│       ├── types/               # TypeScript types
│       └── utils/               # Utilities
├── frontend/                    # Next.js app (:3000)
│   └── src/
│       ├── app/                 # Pages
│       └── components/          # React components
├── database/
│   └── init.sql                 # Database schema
├── docker-compose.yml           # All services
└── .env                         # Configuration
```

## 🐛 Common Issues & Solutions

### "Port already in use"
```bash
# Find and kill process
lsof -i :4000  # Mac/Linux
netstat -ano | findstr :4000  # Windows

# Or use different port in .env
PORT=4001
```

### "Cannot connect to database"
```bash
# Make sure PostgreSQL is running
docker-compose ps postgres

# Check if it's healthy
docker-compose exec postgres pg_isready

# Restart if needed
docker-compose restart postgres
```

### "Module not found" errors
```bash
# Rebuild packages
cd backend
npm run build --workspaces

# Or clean install
rm -rf node_modules package-lock.json
npm install
```

### Docker issues
```bash
# Reset everything
docker-compose down -v
docker-compose up -d

# Clear Docker cache
docker system prune -a
```

## 📊 What's Working Now

✅ **Infrastructure**
- PostgreSQL database with complete schema
- Redis cache
- MongoDB for analytics
- RabbitMQ message queue

✅ **Backend Services**
- API Gateway (routing, rate limiting)
- Auth Service (register, login, JWT)
- Finance Service (transactions structure)
- AI Service (FastAPI ready)

✅ **Frontend**
- Next.js 14 setup
- Tailwind CSS styling
- Landing page
- Routing ready

## 🚧 What Needs Implementation

The structure is complete, but some services need full business logic:
- Transaction Service full implementation (I provided the complete code earlier)
- Inventory Service
- CRM Service
- Analytics Service
- AI Assistant integration with Anthropic Claude

## 🔐 Security Notes

**IMPORTANT**: Change these in production:
- `JWT_SECRET` - Use strong random string (32+ chars)
- All database passwords
- API keys for external services

## 📖 Next Steps

1. ✅ Get everything running
2. 📚 Read the API documentation at http://localhost:4000/api-docs (when implemented)
3. 🎨 Customize the frontend in `frontend/src/app`
4. 🔧 Add your business logic to services
5. 🧪 Write tests
6. 🚀 Deploy!

## 💡 Tips

- Use Docker for consistency across environments
- Keep `.env` file secret (never commit it!)
- Check logs when something doesn't work: `docker-compose logs -f`
- Each service can be developed independently
- Frontend hot-reloads on changes
- Backend needs restart after TypeScript changes (or use ts-node-dev)

## 🆘 Need Help?

- Check README.md for detailed documentation
- Read INSTALLATION.md for troubleshooting
- Review docker-compose.yml for service configuration
- Check database/init.sql for schema reference

## 🎉 Success!

If you see:
- Frontend loading at localhost:3000 ✓
- API Gateway responding at localhost:4000 ✓
- Services showing "status: ok" ✓

**Congratulations! UMKMPRO is running!** 🎊

Now you can start building your UMKM super-app!

---

**Built with ❤️ for Indonesian SMEs**
