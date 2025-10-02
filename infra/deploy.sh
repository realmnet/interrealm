#!/bin/bash

echo "Deploying InterRealm to Kubernetes..."

# Check if Istio is installed
kubectl get namespace istio-system > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Error: Istio is not installed. Please install Istio first."
    echo "Visit: https://istio.io/latest/docs/setup/getting-started/"
    exit 1
fi

# Create namespaces
echo "Creating namespaces..."
kubectl apply -f namespaces.yaml

# Wait for namespace creation
sleep 2

# Deploy Istio configuration
echo "Configuring Istio..."
kubectl apply -f istio/gateway.yaml
kubectl apply -f istio/virtualservice.yaml
kubectl apply -f istio/destinationrule.yaml
kubectl apply -f istio/telemetry.yaml

# Deploy realms
echo "Deploying Realm A..."
kubectl apply -f deployments/realm-a.yaml

echo "Deploying Realm B..."
kubectl apply -f deployments/realm-b.yaml

# Wait for deployments
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=realm-a -n realm-a --timeout=60s
kubectl wait --for=condition=ready pod -l app=realm-b -n realm-b --timeout=60s

echo "Deployment complete!"
echo ""
echo "Check status with:"
echo "  kubectl get pods -n realm-a"
echo "  kubectl get pods -n realm-b"
echo ""
echo "View logs with:"
echo "  kubectl logs -f -l app=realm-a -n realm-a"
echo "  kubectl logs -f -l app=realm-b -n realm-b"