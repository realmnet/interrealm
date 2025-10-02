# InterRealm

A multi-agent communication framework using Istio service mesh for message routing.

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm
- Docker & Kubernetes
- Istio installed in cluster

### Local Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run locally (separate terminals)
cd examples/realm-a && pnpm start
cd examples/realm-b && pnpm start
```

### Kubernetes Deployment

```bash
# Build Docker images
docker build -f examples/realm-a/Dockerfile -t interrealm/realm-a:latest .
docker build -f examples/realm-b/Dockerfile -t interrealm/realm-b:latest .

# Apply K8s manifests
kubectl apply -f infra/namespaces.yaml
kubectl apply -f infra/istio/
kubectl apply -f infra/deployments/

# Check status
kubectl get pods -n realm-a
kubectl get pods -n realm-b
```

## Architecture

- **realm-sdk**: Core runtime for agent communication
- **realm-a/b**: Example agents that exchange ping/pong messages
- **Istio**: Service mesh handling routing, telemetry, and resilience

## Message Flow

1. Realm A sends message to Realm B
2. Message includes routing metadata (TTL, path)
3. Istio handles service discovery and load balancing
4. Realm B receives and processes message
5. Optional: Realm B sends response back

## Development

```bash
# Watch mode for SDK
cd packages/realm-sdk && pnpm dev

# Test message routing
curl -X POST http://localhost:3001/message \
  -H "Content-Type: application/json" \
  -d '{"sourceRealm":"test","targetRealm":"realm-a","payload":{"type":"ping"}}'
```