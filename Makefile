# InterRealm Makefile
.PHONY: install build test docker-build docker-push deploy clean debug-istio debug-routing dev logs db-up db-down db-reset dev-full help setup

# Development Setup
install:
	pnpm install

build:
	pnpm build

test:
	pnpm test

# Database Management
db-up:
	@echo "🚀 Starting development database..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "⏳ Waiting for database to be ready..."
	@sleep 5
	@echo "✅ Database is ready at localhost:5432"

db-down:
	@echo "🛑 Stopping development database..."
	docker-compose -f docker-compose.dev.yml down

db-reset:
	@echo "🔄 Resetting development database..."
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.dev.yml up -d
	@sleep 5
	@echo "✅ Database reset complete"

db-push:
	@echo "📄 Pushing Prisma schema changes..."
	cd packages/prisma-schema && pnpm prisma db push
	@echo "✅ Schema changes applied"

db-generate:
	@echo "🔧 Generating Prisma client..."
	cd packages/prisma-schema && pnpm prisma generate
	@echo "✅ Prisma client generated"

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	cd packages/prisma-schema && pnpm prisma studio

db-logs:
	docker-compose -f docker-compose.dev.yml logs -f postgres

# Port Management
kill-ports:
	@echo "🔍 Checking for processes on development ports..."
	@-lsof -ti:5173 | xargs kill -9 2>/dev/null || echo "Port 5173 (console) is free"
	@-lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Port 3000 (control-plane) is free"
	@-lsof -ti:5432 | xargs kill -9 2>/dev/null || echo "Port 5432 (postgres) is free"
	@echo "✅ Ports cleared"

check-ports:
	@echo "🔍 Checking port usage..."
	@echo "Port 5173 (Console):" && (lsof -i:5173 | grep LISTEN || echo "  Available")
	@echo "Port 3000 (Control Plane):" && (lsof -i:3000 | grep LISTEN || echo "  Available")
	@echo "Port 5432 (PostgreSQL):" && (lsof -i:5432 | grep LISTEN || echo "  Available")

# Development
dev:
	pnpm dev

dev-full:
	@echo "🚀 Starting full development environment..."
	@$(MAKE) db-up
	@$(MAKE) db-push
	@echo "🖥️  Starting applications..."
	pnpm dev

dev-run: kill-ports
	@echo "🚀 Starting complete development environment..."
	@$(MAKE) db-up
	@$(MAKE) db-push
	@$(MAKE) db-generate
	@echo "🖥️  Starting all applications..."
	@echo "📱 Console: http://localhost:5173"
	@echo "🔧 Control Plane API: http://localhost:3000"
	@echo "🎨 Prisma Studio: http://localhost:5555"
	pnpm dev

dev-api:
	@echo "🔧 Starting control plane API only..."
	pnpm dev:api

dev-console:
	@echo "🎨 Starting console UI only..."
	pnpm dev:console

# Quick development commands
setup:
	@echo "⚙️  Setting up InterRealm development environment..."
	@$(MAKE) install
	@$(MAKE) db-up
	@$(MAKE) db-push
	@$(MAKE) db-generate
	@echo "✅ Setup complete! Run 'make dev-run' to start developing"

clean-dist:
	pnpm clean

REGISTRY = interrealm
# Docker
docker-build:
	docker build -f examples/realm-a/Dockerfile -t interrealm/realm-a:latest .
	docker build -f examples/realm-b/Dockerfile -t interrealm/realm-b:latest .


docker-push:
	docker push $(REGISTRY)/realm-a:latest
	docker push $(REGISTRY)/realm-b:latest

deploy-simple:
	kubectl apply -f infra/namespaces.yaml
	kubectl apply -f infra/deployments/
	@echo "Waiting for pods to be ready..."
	kubectl wait --for=condition=ready pod -l app=realm-a -n realm-a --timeout=60s || true
	kubectl wait --for=condition=ready pod -l app=realm-b -n realm-b --timeout=60s || true
	@echo "\n=== Deployment complete ==="
	kubectl get pods -n realm-a
	kubectl get pods -n realm-b
	
# Kubernetes Deployment
deploy:
	kubectl apply -f infra/namespaces.yaml
	sleep 2
	kubectl apply -f infra/istio/
	kubectl apply -f infra/deployments/
	@echo "Waiting for pods to be ready..."
	kubectl wait --for=condition=ready pod -l app=realm-a -n realm-a --timeout=60s
	kubectl wait --for=condition=ready pod -l app=realm-b -n realm-b --timeout=60s

# Debugging
debug-istio:
	@echo "=== Istio Proxy Logs ==="
	kubectl logs -n realm-a -l app=realm-a -c istio-proxy --tail=50
	@echo ""
	kubectl logs -n realm-b -l app=realm-b -c istio-proxy --tail=50
	@echo "\n=== Istio Config Dump ==="
	istioctl proxy-config routes -n realm-a deployment/realm-a
	@echo ""
	istioctl proxy-config clusters -n realm-a deployment/realm-a
	@echo "\n=== Service Endpoints ==="
	kubectl get endpoints -n realm-a
	kubectl get endpoints -n realm-b

debug-routing:
	@echo "=== Testing realm-a -> realm-b connectivity ==="
	kubectl exec -n realm-a deployment/realm-a -c realm-a -- curl -v http://realm-b.realm-b.svc.cluster.local:3002/health
	@echo "\n=== Testing realm-b -> realm-a connectivity ==="
	kubectl exec -n realm-b deployment/realm-b -c realm-b -- curl -v http://realm-a.realm-a.svc.cluster.local:3001/health

logs:
	@echo "=== Realm A Logs ==="
	kubectl logs -f -l app=realm-a -n realm-a --tail=20
	@echo "\n=== Realm B Logs ==="
	kubectl logs -f -l app=realm-b -n realm-b --tail=20

logs-istio:
	kubectl logs -n realm-a -l app=realm-a -c istio-proxy -f --tail=50

# Cleanup
clean:
	kubectl delete -f infra/deployments/ || true
	kubectl delete -f infra/istio/ || true
	kubectl delete -f infra/namespaces.yaml || true

clean-all: clean clean-dist
	rm -rf node_modules
	rm -rf packages/*/node_modules
	rm -rf examples/*/node_modules
	rm -rf apps/*/node_modules

# Local Testing
local-realm-a:
	cd examples/realm-a && pnpm start

local-realm-b:
	cd examples/realm-b && pnpm start

# Help
help:
	@echo "🌟 InterRealm Development Commands:"
	@echo ""
	@echo "📦 Setup & Dependencies:"
	@echo "  make setup          - Complete development environment setup"
	@echo "  make install        - Install pnpm dependencies"
	@echo ""
	@echo "🗄️  Database Management:"
	@echo "  make db-up          - Start PostgreSQL database"
	@echo "  make db-down        - Stop database"
	@echo "  make db-reset       - Reset database with fresh schema"
	@echo "  make db-push        - Push Prisma schema changes"
	@echo "  make db-generate    - Generate Prisma client"
	@echo "  make db-studio      - Open Prisma Studio"
	@echo "  make db-logs        - View database logs"
	@echo ""
	@echo "🚀 Development:"
	@echo "  make dev-run        - 🌟 Kill ports + start everything (recommended)"
	@echo "  make dev-full       - Start database + all apps"
	@echo "  make dev            - Start all apps (assumes DB running)"
	@echo "  make dev-api        - Start control plane API only"
	@echo "  make dev-console    - Start console UI only"
	@echo ""
	@echo "🔧 Port Management:"
	@echo "  make kill-ports     - Kill processes on development ports"
	@echo "  make check-ports    - Check which ports are in use"
	@echo ""
	@echo "🔨 Build & Test:"
	@echo "  make build          - Build all packages"
	@echo "  make test           - Run tests"
	@echo "  make clean          - Clean build artifacts"
	@echo ""
	@echo "🐳 Docker & Kubernetes:"
	@echo "  make docker-build   - Build Docker images"
	@echo "  make docker-push    - Push Docker images"
	@echo "  make deploy         - Deploy to Kubernetes"
	@echo "  make debug-istio    - Debug Istio configuration"
	@echo "  make logs           - View realm logs"
	@echo ""
	@echo "💡 Quick Start:"
	@echo "  1. make setup       - First time setup"
	@echo "  2. make dev-run     - Start everything (kills ports first)"
	@echo "  3. Open http://localhost:5173 (Console)"
	@echo "  4. API available at http://localhost:3000"
	@echo "  5. Prisma Studio at http://localhost:5555"	