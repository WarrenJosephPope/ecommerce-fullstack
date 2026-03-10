# E-Commerce Microservices Platform

This project is a microservices-based e-commerce platform built with Node.js, Docker, PostgreSQL, Redis, and MinIO.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Architecture Overview](#architecture-overview)

---

## Prerequisites

Before getting started, ensure you have the following installed on your system:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Docker** and **Docker Compose**
- **Git**

---

## Development Setup

The development setup runs infrastructure services (PostgreSQL, Redis, MinIO, Logger) in Docker containers while allowing you to run application services locally for faster iteration and hot-reloading.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd ecom
```

### Step 2: Configure Environment Variables

#### Root Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and adjust the values as needed:
   ```env
   NODE_ENV=development
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_postgres_password
   JWT_ACCESS_SECRET=your-super-secret-access-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   # ... adjust other values as needed
   ```

#### Service-Level Environment Configuration

Configure environment variables for each service:

1. **Auth Service**: Copy and configure `backend/services/auth/.env.example` to `backend/services/auth/.env`
2. **API Gateway**: Copy and configure `backend/api-gateway/.env.example` to `backend/api-gateway/.env`
3. **Other Services**: Repeat for any additional services in `backend/services/`

> **Note**: Make sure service-level environment files match the root configuration (especially database URLs, ports, and secrets).

### Step 3: Start Infrastructure Services

Start the development Docker containers (PostgreSQL, Redis, MinIO, etc.):

```bash
docker compose -f docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL database
- Redis cache
- MinIO object storage

Verify containers are running:
```bash
docker compose -f docker-compose.dev.yml ps
```

### Step 4: Install Dependencies

Install all Node.js dependencies for services and the API gateway:

```bash
npm install
```

This will install dependencies for:
- Auth service
- Logger service
- API Gateway
- Root project (concurrently)

### Step 5: Run Database Migrations

Deploy Prisma migrations to set up the database schema:

```bash
npm run deploy
```

### Step 6: Generate Prisma Client

Generate the Prisma client for type-safe database access:

```bash
npm run generate
```

### Step 7: Start Development Servers

Start all application services in development mode with hot-reloading:

```bash
npm run dev
```

This command runs:
- Logger service (hot-reload enabled)
- Auth service (hot-reload enabled)
- API Gateway (hot-reload enabled)

All services will automatically restart when you make code changes.

### Accessing Services

- **API Gateway**: `http://localhost:{API_GATEWAY_PORT}` (default: 3000)
- **Auth Service**: `http://localhost:4001`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **MinIO Console**: `http://localhost:9001`

### API Documentation

The Auth Service includes interactive Swagger/OpenAPI documentation for all authentication endpoints.

**Access via API Gateway (Recommended):**
```
http://localhost:{API_GATEWAY_PORT}/api/auth/docs
```

**Direct Service Access (Development):**
```
http://localhost:4001/api/auth/docs
```

The Swagger UI provides:
- Interactive API testing
- Request/response schemas
- Authentication requirements
- Example payloads
- All available endpoints organized by category:
  - Health Check
  - Email Authentication
  - Phone Authentication (OTP)
  - Anonymous Authentication
  - Token Management

> **Tip**: You can test protected endpoints by clicking "Authorize" in Swagger UI and entering a valid JWT access token.

### Development Workflow

1. Make changes to service code
2. Services automatically reload
3. Test your changes via API Gateway or direct service endpoints
4. View logs in terminal and Logger service

### Stopping Development Environment

To stop the infrastructure containers:

```bash
docker compose -f docker-compose.dev.yml down
```

To stop services, press `Ctrl+C` in the terminal running `npm run dev`.

---

## Production Setup

The production setup runs all services in Docker containers for easy deployment and scaling.

### Step 1: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. **Important**: Update the `.env` file with production-ready values:
   ```env
   NODE_ENV=production
   
   # Use strong passwords
   POSTGRES_PASSWORD=strong_secure_password_here
   
   # Generate secure secrets (use openssl rand -base64 32)
   JWT_ACCESS_SECRET=generate_a_secure_random_secret_key
   JWT_REFRESH_SECRET=generate_another_secure_random_secret_key
   
   # Configure production URLs
   MINIO_PUBLIC_URL=https://your-domain.com
   
   # Adjust other values for production
   LOG_LEVEL=warn
   LOG_RETENTION_DAYS=30
   ```

   > **Security Note**: Never use the example secrets in production. Generate new secure random strings.

### Step 2: Start Production Services

Start all services in production mode:

```bash
docker compose up -d
```

This will:
- Build all service images
- Start all containers in detached mode
- Set up networking between services
- Run database migrations automatically (if configured)

### Step 3: Verify Deployment

Check that all containers are running:

```bash
docker compose ps
```

View logs to ensure services started correctly:

```bash
docker compose logs -f
```

### API Documentation

Once deployed, access the interactive API documentation:

```
http://localhost:{API_GATEWAY_PORT}/api/auth/docs
```

The Swagger UI provides complete documentation for all authentication endpoints, including request/response schemas and interactive testing capabilities.

> **Production Note**: Consider restricting access to API documentation in production environments by configuring the API Gateway to require authentication for the `/api/auth/docs` endpoint.

### Managing Production Services

**View logs for a specific service:**
```bash
docker compose logs -f auth
```

**Restart a service:**
```bash
docker compose restart auth
```

**Stop all services:**
```bash
docker compose down
```

> **Note**: Data persists in the `./data` folder and will not be deleted when stopping containers.

**Update services after code changes:**
```bash
docker compose up -d --build
```

---

## Architecture Overview

### Services

- **API Gateway**: Routes requests to appropriate microservices, handles authentication, rate limiting
- **Auth Service**: User authentication, JWT token management, OTP verification
- **Logger Service**: Centralized logging for all services
- **Profile Service**: User profile management (if implemented)

### Infrastructure

- **PostgreSQL**: Primary database with multiple isolated databases per service
- **Redis**: Caching and session storage
- **MinIO**: S3-compatible object storage for files and images

### Service Communication

Services communicate via:
- HTTP/REST APIs through the API Gateway
- Direct service-to-service calls (in production)
- Shared Redis cache for session data

### Data Persistence

All data is persisted locally in the `./data` folder:
- **PostgreSQL data**: `./data/postgres/`
- **Redis snapshots**: `./data/redis/`
- **MinIO storage**: `./data/minio/`

This ensures your data is preserved across container restarts and won't be lost when stopping or rebuilding containers.

---

## Troubleshooting

### Port Conflicts

If you get port binding errors, check if another service is using the required ports:
```bash
# Windows
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

### Database Connection Issues

Ensure PostgreSQL container is running and healthy:
```bash
docker compose -f docker-compose.dev.yml logs postgres
```

### Permission Issues

On Linux/Mac, you may need to adjust permissions for data folders:
```bash
sudo chmod -R 755 data/
```

### Prisma Migration Failures

If migrations fail, you can reset the database:
```bash
cd backend/services/auth
npx prisma migrate reset
```

> **Note**: This will reset the database schema. Your data files remain in `./data/postgres/` but the database will be reinitialized.

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---
