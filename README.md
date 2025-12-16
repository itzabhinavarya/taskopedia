# TaskOPedia

Enterprise-grade task and project management microservices architecture, built using NestJS, Prisma, and Turborepo.

📋 **[View Feature Roadmap](ROADMAP.md)** - Track upcoming features and implementation progress

## 🏗️ Architecture

This monorepo contains three microservices:

- **API Service** - Core business logic with Prisma ORM and database management
- **Gateway Service** - API Gateway with request routing and proxy middleware
- **Logger Service** - Centralized logging service using Winston

## 🚀 Setup

### Option 1: Setup Manually

#### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 10.0.0
- MySQL database

#### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm run db:generate
```

#### Environment Setup

Create `.env` file in root directory:

```env
DATABASE_URL=mysql://user:password@localhost:3306/taskopedia
JWT_SECRET=your-secret-key-change-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d
API_PORT=4000
GATEWAY_PORT=3000
LOGGER_PORT=4001
API_URL=http://localhost:4000
LOGGER_URL=http://localhost:4001
NODE_ENV=development
```

#### Database Setup

```bash
# Run migrations
pnpm run db:migrate
```

#### Development

```bash
# Run all services
pnpm run dev:all

# Or run individually
pnpm run dev:api      # API on port 4000
pnpm run dev:gateway  # Gateway on port 3000
pnpm run dev:logger   # Logger on port 4001
```

#### Production

```bash
# Build all services
pnpm run build

# Start all services
pnpm run start:all
```

---

### Option 2: Setup with Docker (Self-Host)

#### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Ports 3000, 4000, 4001, and 3306 available

#### Environment Setup

Create `.env` file in root directory:

```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=taskopedia
MYSQL_USER=taskopedia
MYSQL_PASSWORD=taskopedia123
MYSQL_PORT=3306

API_PORT=4000
GATEWAY_PORT=3000
LOGGER_PORT=4001

API_URL=http://api:4000
GATEWAY_URL=http://gateway:3000
LOGGER_URL=http://logger:4001

JWT_SECRET=your-secret-key-change-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d

NODE_ENV=production
```

#### Quick Start

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f
```

#### Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove containers with volumes (⚠️ deletes database data)
docker-compose down -v

# View logs
docker-compose logs -f api

# Restart service
docker-compose restart api

# Access container in interactive mode
docker-compose exec api sh
# Or using container name directly
docker exec -it taskopedia-api /bin/sh
docker exec -it taskopedia-gateway /bin/sh
docker exec -it taskopedia-logger /bin/sh
docker exec -it taskopedia-mysql /bin/bash

# Access MySQL database and view records
# Note: docker-compose commands must be run from project root directory
docker-compose exec mysql mysql -u taskopedia -ptaskopedia123 taskopedia
# Or using container name directly (works from any directory)
docker exec -it taskopedia-mysql mysql -u taskopedia -ptaskopedia123 taskopedia

# Once inside MySQL, you can run:
# SHOW TABLES;
# SELECT * FROM User;
# SELECT * FROM Project;
# SELECT * FROM Task;
# EXIT;
```

#### Access Services

- **Gateway:** http://localhost:3000
- **API:** http://localhost:4000
- **Logger:** http://localhost:4001
- **MySQL:** localhost:3306

**Note:** Database migrations run automatically on API container startup.

---

## 📦 Project Structure

```
taskopedia/
├── apps/
│   ├── api/          # API service with Prisma
│   ├── gateway/      # API Gateway
│   └── logger/       # Centralized logging
├── packages/         # Shared packages
│   ├── common/
│   ├── config/
│   ├── contracts/
│   └── types/
└── infra/           # Infrastructure configs
```

## 🔐 Authentication

JWT-based authentication system with the following endpoints:

**Public Endpoints:**
- `POST /api/user/signup` - Register new user
- `POST /api/user/login` - Login (returns JWT token)
- `POST /api/user/verify-otp` - Verify account with OTP
- `POST /api/user/resend-otp` - Resend OTP
- `POST /api/user/reset-password` - Reset password

**Protected Endpoints** (require `Authorization: Bearer <token>` header):
- User CRUD operations
- Project management (create, update, archive, delete)
- Task management (create, update, archive, delete)
- Dashboard statistics

## 🗄️ Database Commands

```bash
pnpm run db:migrate   # Run migrations
pnpm run db:push      # Push schema changes
pnpm run db:studio    # Open Prisma Studio
pnpm run db:reset     # Reset database
```

## 🧪 Testing & Quality

```bash
pnpm run test         # Run tests
pnpm run test:cov     # Test coverage
pnpm run lint         # Lint code
pnpm run format       # Format code
```

## 🛠️ Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** Prisma ORM (MySQL)
- **Authentication:** JWT (jsonwebtoken)
- **Logging:** Winston
- **Build Tool:** Turborepo
- **Package Manager:** pnpm

## 📝 License

ISC
