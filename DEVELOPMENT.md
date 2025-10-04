# 🚀 InterRealm Development Guide

This guide will help you set up and run the InterRealm project locally for development.

## 📋 Prerequisites

- **Node.js** (v18 or later)
- **pnpm** (v8 or later)
- **Docker** and **Docker Compose**
- **Git**

## 🔧 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd interrealm

# Complete setup (installs deps + starts database)
make setup
```

### 2. Start Development Environment

```bash
# Start everything (database + all apps)
make dev-full
```

**That's it!** 🎉

- **Console UI**: http://localhost:5173
- **Control Plane API**: http://localhost:3000
- **Database**: localhost:5432

## 🗄️ Database

The project uses PostgreSQL with automatic schema initialization.

### Database Commands

```bash
make db-up      # Start database
make db-down    # Stop database
make db-reset   # Reset with fresh schema
make db-logs    # View database logs
```

### Default Database Config

- **Host**: localhost:5433
- **Database**: realmmesh
- **User**: postgres
- **Password**: postgres

## 🏃‍♂️ Development Options

### Start Everything
```bash
make dev-full   # Database + Control Plane + Console
```

### Start Individual Services
```bash
make dev-api      # Control plane API only
make dev-console  # Console UI only
make dev          # All apps (assumes DB running)
```

### Package Manager Scripts
```bash
pnpm dev          # Start all apps
pnpm dev:api      # Control plane only
pnpm dev:console  # Console only
pnpm db:up        # Start database
pnpm db:reset     # Reset database
```

## 🔑 Authentication

Authentication is **disabled by default** for fast development iteration.

### Current Setup

- **Development**: Auth disabled (`VITE_AUTH_ENABLED=false`)
- **API Key**: `dev-test-key-12345` (hardcoded for dev)

### Enable Authentication

Edit `apps/console/.env.local`:
```bash
VITE_AUTH_ENABLED=true
```

## 📁 Project Structure

```
interrealm/
├── apps/
│   ├── console/          # React UI (Vite + TypeScript)
│   └── control-plane/    # Express API (TypeScript)
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── validation/      # Zod schemas
│   └── ...
├── infra/
│   └── database/
│       └── init/        # Database schema & seeds
└── docker-compose.dev.yml
```

## 🛠️ Available Commands

Run `make help` to see all available commands:

```bash
make help
```

### Key Commands

| Command | Description |
|---------|-------------|
| `make setup` | First-time setup |
| `make dev-full` | Start everything |
| `make db-reset` | Reset database |
| `make clean` | Clean build artifacts |

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if database is running
docker ps | grep postgres

# Reset database
make db-reset

# View database logs
make db-logs
```

### Port Conflicts

Default ports:
- **5173**: Console UI
- **3000**: Control Plane API
- **5432**: PostgreSQL

### Clear Everything and Restart

```bash
make db-down
make clean
make setup
make dev-full
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Build everything
pnpm build
```

## 📝 Environment Variables

### Console App (`apps/console/.env.local`)
```bash
VITE_AUTH_ENABLED=false                    # Enable/disable auth
VITE_API_KEY=dev-test-key-12345           # API key
VITE_CONTROL_PLANE_URL=http://localhost:3000  # API URL
```

### Control Plane (`apps/control-plane/.env.local`)
```bash
PORT=3000                                 # Server port
CONTROL_PLANE_API_KEY=dev-test-key-12345  # API key
DB_HOST=localhost                         # Database host
DB_PORT=5432                              # Database port
DB_NAME=interrealm                        # Database name
DB_USER=postgres                          # Database user
DB_PASSWORD=postgres                      # Database password
```

## 🚀 Ready to Develop!

1. `make setup` - First time setup
2. `make dev-full` - Start everything
3. Open http://localhost:5173
4. Start building realms! 🌟

---

For more help, run `make help` or check the main README.md.