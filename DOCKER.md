# Docker Setup Guide for TaskOPedia

Complete Docker setup for running all microservices in containers.

## 📋 Prerequisites

- Docker Desktop installed (or Docker Engine + Docker Compose)
- At least 2GB free disk space
- Ports 3000, 4000, 4001, and 3306 available

## 🚀 Quick Start

### 1. Create Environment File

Copy the example environment file:

```bash
# Create .env file from template
cat > .env << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=taskopedia
MYSQL_USER=taskopedia
MYSQL_PASSWORD=taskopedia123
MYSQL_PORT=3306

# Service Ports
API_PORT=4000
GATEWAY_PORT=3000
LOGGER_PORT=4001

# Service URLs (for Docker containers)
API_URL=http://api:4000
GATEWAY_URL=http://gateway:3000
LOGGER_URL=http://logger:4001

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=production
EOF
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### 2. Build and Start Services

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api
```

### 3. Run Database Migrations

After MySQL is ready, run Prisma migrations:

```bash
# Option 1: Run migration inside API container
docker-compose exec api pnpm run db:migrate

# Option 2: Run migration from host (if you have pnpm installed)
pnpm run db:migrate
```

### 4. Verify Services

```bash
# Check all services are running
docker-compose ps

# Test Gateway (should proxy to API)
curl http://localhost:3000

# Test API directly
curl http://localhost:4000

# Test Logger
curl http://localhost:4001
```

## 🏗️ Architecture

### Services

1. **MySQL** (`mysql`)
   - Port: 3306
   - Database: `taskopedia`
   - Persistent volume: `mysql_data`

2. **API Service** (`api`)
   - Port: 4000
   - Depends on: MySQL
   - Handles all business logic

3. **Gateway Service** (`gateway`)
   - Port: 3000
   - Depends on: API
   - Routes `/api/*` to API service

4. **Logger Service** (`logger`)
   - Port: 4001
   - Logs directory: `logger_logs` volume

### Network

All services communicate via `taskopedia-network` bridge network using container names:
- API URL: `http://api:4000`
- Logger URL: `http://logger:4001`

## 📝 Common Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Restart a specific service
docker-compose restart api
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f gateway
docker-compose logs -f logger
docker-compose logs -f mysql

# Last 100 lines
docker-compose logs --tail=100 api
```

### Execute Commands in Containers

```bash
# Run migration
docker-compose exec api pnpm run db:migrate

# Generate Prisma client
docker-compose exec api pnpm run db:generate

# Open Prisma Studio
docker-compose exec api pnpm run db:studio
# Then access at http://localhost:5555

# Access container shell
docker-compose exec api sh
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache api

# Rebuild and restart
docker-compose up -d --build
```

## 🔧 Configuration

### Environment Variables

Edit `.env` file to customize:

- **Database**: Change MySQL credentials
- **Ports**: Change service ports if needed
- **JWT**: Set secure JWT secret
- **Service URLs**: Already configured for Docker networking

### Port Mapping

Default port mappings:
- Gateway: `3000:3000` (host:container)
- API: `4000:4000`
- Logger: `4001:4001`
- MySQL: `3306:3306`

To change ports, update `.env` file and restart services.

## 🗄️ Database Management

### Access MySQL

```bash
# Connect via docker exec
docker-compose exec mysql mysql -u taskopedia -p taskopedia

# Or from host (if MySQL client installed)
mysql -h localhost -P 3306 -u taskopedia -p taskopedia
```

### Backup Database

```bash
# Create backup
docker-compose exec mysql mysqldump -u taskopedia -ptaskopedia123 taskopedia > backup.sql

# Restore backup
docker-compose exec -T mysql mysql -u taskopedia -ptaskopedia123 taskopedia < backup.sql
```

### Reset Database

```bash
# Stop services and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Run migrations
docker-compose exec api pnpm run db:migrate
```

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Check service status
docker-compose ps

# Check if ports are in use
netstat -an | grep -E '3000|4000|4001|3306'
```

### Lockfile Outdated Error

If you see `ERR_PNPM_OUTDATED_LOCKFILE` error:

**Option 1: Update lockfile locally (Recommended)**
```bash
# Windows PowerShell
.\scripts\update-lockfile.ps1

# Linux/Mac
chmod +x scripts/update-lockfile.sh
./scripts/update-lockfile.sh

# Or manually
pnpm install
```

**Option 2: Docker will handle it automatically**
The Dockerfile is configured to handle outdated lockfiles. Just rebuild:
```bash
docker-compose build --no-cache
```

The Dockerfile uses `--no-frozen-lockfile` in dependencies stage, so it will update the lockfile during build if needed.

### Database Connection Issues

```bash
# Check MySQL is healthy
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Verify DATABASE_URL in API container
docker-compose exec api env | grep DATABASE_URL
```

### Prisma Client Not Generated

```bash
# Generate Prisma client
docker-compose exec api pnpm run db:generate

# Or rebuild API container
docker-compose build --no-cache api
docker-compose up -d api
```

### Gateway Not Routing

```bash
# Check API_URL environment variable
docker-compose exec gateway env | grep API_URL

# Should be: API_URL=http://api:4000
# If not, check .env file
```

### Permission Issues

```bash
# Fix log directory permissions
docker-compose exec logger chmod -R 777 /app/apps/logger/logs
```

### Build Failures

```bash
# Clean build (removes cache)
docker-compose build --no-cache

# Clean everything including volumes
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
```

## 📊 Monitoring

### Check Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats taskopedia-api
```

### Health Checks

All services have health checks configured:
- MySQL: `mysqladmin ping`
- API: HTTP check on port 4000
- Gateway: HTTP check on port 3000
- Logger: HTTP check on port 4001

View health status:
```bash
docker-compose ps
```

## 🚢 Production Deployment

### Security Checklist

1. ✅ Change `JWT_SECRET` to strong random string
2. ✅ Change MySQL root password
3. ✅ Change MySQL user password
4. ✅ Use environment-specific `.env` files
5. ✅ Enable SSL/TLS for database connections
6. ✅ Set up proper firewall rules
7. ✅ Use Docker secrets for sensitive data
8. ✅ Enable logging and monitoring

### Production Optimizations

1. Use `.env.production` file
2. Enable Docker build cache
3. Use multi-stage builds (already implemented)
4. Set resource limits in docker-compose
5. Use Docker secrets instead of env files
6. Set up reverse proxy (nginx/traefik)
7. Enable health checks and auto-restart

### Example Production docker-compose.override.yml

```yaml
version: '3.8'

services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    restart: always

  gateway:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    restart: always

  logger:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    restart: always
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose logs`
2. Verify environment variables: `docker-compose config`
3. Check service health: `docker-compose ps`
4. Review this guide's troubleshooting section

---

**Happy Dockerizing! 🐳**

