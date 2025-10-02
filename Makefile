# Makefile
.PHONY: install build test docker-build docker-push deploy clean debug-istio debug-routing dev logs

# Development
install:
	pnpm install

build:
	pnpm build

test:
	pnpm test

dev:
	pnpm dev

clean-dist:
	pnpm clean

# Docker
docker-build:
	docker build -f examples/realm-a/Dockerfile -t interrealm/realm-a:latest .
	docker build -f examples/realm-b/Dockerfile -t interrealm/realm-b:latest .

docker-push:
	docker push $(REGISTRY)/interrealm/realm-a:latest
	docker push $(REGISTRY)/interrealm/realm-b:latest

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
	@echo "InterRealm Makefile Commands:"
	@echo "  make install        - Install dependencies"
	@echo "  make build          - Build all packages"
	@echo "  make test           - Run tests"
	@echo "  make dev            - Run in development mode"
	@echo "  make docker-build   - Build Docker images"
	@echo "  make docker-push    - Push Docker images (set REGISTRY env var)"
	@echo "  make deploy         - Deploy to Kubernetes"
	@echo "  make debug-istio    - Debug Istio configuration"
	@echo "  make debug-routing  - Test inter-realm connectivity"
	@echo "  make logs           - View realm logs"
	@echo "  make logs-istio     - View Istio proxy logs"
	@echo "  make clean          - Clean Kubernetes resources"
	@echo "  make clean-all      - Clean everything including node_modules"
	@echo "  make local-realm-a  - Run Realm A locally"
	@echo "  make local-realm-b  - Run Realm B locally"