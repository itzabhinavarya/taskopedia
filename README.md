# TaskOPedia

Enterprise-grade task and project management microservices architecture, built using NestJS, Prisma, and Turborepo.

📋 **[View Feature Roadmap](ROADMAP.md)** - Track upcoming features and implementation progress

## 🏗️ Architecture

This monorepo contains three microservices:

- **API Service** - Core business logic with Prisma ORM and database management (internal only, not directly accessible)
- **Gateway Service** - API Gateway with request routing and proxy middleware (main entry point on port 3000)
- **Logger Service** - Centralized logging service using Winston with PostgreSQL storage

**Request Flow:**
```
Client → Gateway (port 3000) → API Service (port 4000, internal)
                              → Logger Service (port 4001)
```

All API requests must go through Gateway at `http://localhost:3000/api/*`. The API service is not directly exposed to the host for security.

## 🚀 Setup

### Option 1: Setup Manually

#### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 10.0.0
- PostgreSQL or MySQL database

#### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm run db:generate
```

#### Environment Setup

Create `.env` file in root directory:

**For PostgreSQL:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskopedia
JWT_SECRET=your-secret-key-change-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d
API_PORT=4000
GATEWAY_PORT=3000
LOGGER_PORT=4001
API_URL=http://localhost:4000
LOGGER_URL=http://localhost:4001
NODE_ENV=development
```

**For MySQL:**
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

**Important:** 
- Make sure `API_URL` is set to `http://localhost:4000` (API service port), not `http://localhost:3000` (Gateway port).
- Update `schema.prisma` datasource provider to match your database (`postgresql` or `mysql`).

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
- Port 3000 available (only Gateway is exposed, all other services are internal)

#### Environment Setup

Create `.env` file in root directory:

**For PostgreSQL (Default):**
```env
POSTGRES_USER=taskopedia
POSTGRES_PASSWORD=taskopedia123
POSTGRES_DB=taskopedia
POSTGRES_PORT=5432

API_PORT=4000
GATEWAY_PORT=3000
LOGGER_PORT=4001

API_URL=http://api:4000
LOGGER_URL=http://logger:4001

JWT_SECRET=your-secret-key-change-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d

NODE_ENV=production
```

**For MySQL (Alternative):**
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
LOGGER_URL=http://logger:4001

JWT_SECRET=your-secret-key-change-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d

NODE_ENV=production
```

**Note:** 
- Default setup uses PostgreSQL. To use MySQL, uncomment MySQL service and comment PostgreSQL in `docker-compose.yml`.
- Update `apps/api/prisma/schema.prisma` datasource provider accordingly (`postgresql` or `mysql`).

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
docker exec -it taskopedia-api /bin/sh
docker exec -it taskopedia-gateway /bin/sh
docker exec -it taskopedia-logger /bin/sh

# Access PostgreSQL database
docker exec -it taskopedia-postgres psql -U taskopedia -d taskopedia
# Once inside PostgreSQL, you can run:
# \dt (list tables)
# SELECT * FROM "User";
# SELECT * FROM "Project";
# SELECT * FROM "Task";
# SELECT * FROM "Log";
# \q (quit)
```

#### Access Services

- **Gateway:** http://localhost:3000 (All API requests go through Gateway)
- **API Endpoints:** http://localhost:3000/api/* (e.g., `/api/user/signup`, `/api/project`)
- **Logger Endpoints:** http://localhost:3000/api/logs (e.g., `/api/logs`, `/api/logs/user/1`)

**Internal Services (not exposed to host):**
- **API Service:** Port 4000 (internal only, accessible via Gateway)
- **Logger Service:** Port 4001 (internal only, accessible via Gateway)
- **PostgreSQL Database:** Port 5432 (internal only, accessible from API/Logger services)

**Important:** 
- Only Gateway (port 3000) is exposed to the host for security
- All other services (API, Logger, Database) are internal and only accessible within Docker network
- Gateway routes `/api/*` to API service and `/api/logs/*` to Logger service
- Database migrations run automatically on API container startup
- To access PostgreSQL: `docker exec -it taskopedia-postgres psql -U taskopedia -d taskopedia`

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

**Public Endpoints** (access via Gateway: `http://localhost:3000/api/...`):
- `POST /api/user/signup` - Register new user
- `POST /api/user/login` - Login (returns JWT token)
- `POST /api/user/verify-otp` - Verify account with OTP
- `POST /api/user/resend-otp` - Resend OTP
- `POST /api/user/reset-password` - Reset password

**Protected Endpoints** (require `Authorization: Bearer <token>` header, access via Gateway):
- User CRUD operations: `GET /api/user`, `PUT /api/user/:id`, etc.
- Project management: `GET /api/project`, `POST /api/project`, etc.
- Task management: `GET /api/tasks`, `POST /api/tasks`, etc.
- Dashboard statistics: `GET /api/dashboard/stats`

**Note:** All API endpoints must be accessed through Gateway at `http://localhost:3000/api/*`. Direct access to API service (port 4000) is disabled for security.

## 🗄️ Database Configuration

### Prisma Schema Provider

Update `apps/api/prisma/schema.prisma` datasource provider:

```prisma
datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}
```

### Database Commands

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
- **Database:** Prisma ORM (PostgreSQL/MySQL)
- **Authentication:** JWT (jsonwebtoken)
- **Logging:** Winston with PostgreSQL storage
- **Build Tool:** Turborepo
- **Package Manager:** pnpm

## 📝 License

ISC
