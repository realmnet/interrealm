-- Seed data for development environment
-- This script creates initial data for testing and development

-- Insert default cluster
INSERT INTO realm_clusters (id, name, status)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Development Cluster',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample realms for development
INSERT INTO realms (id, name, cluster_id, realm_type, container_image, container_version, status)
VALUES
  (
    'realm://org.00000000-0000-0000-0000-000000000000.bridge-main',
    'Main Bridge Realm',
    '00000000-0000-0000-0000-000000000000',
    'bridge',
    'interrealm/bridge-realm',
    'latest',
    'running'
  ),
  (
    'realm://org.00000000-0000-0000-0000-000000000000.gateway-api',
    'API Gateway Realm',
    '00000000-0000-0000-0000-000000000000',
    'gateway',
    'interrealm/api-gateway',
    'latest',
    'running'
  ),
  (
    'realm://org.00000000-0000-0000-0000-000000000000.ai-assistant',
    'AI Assistant Realm',
    '00000000-0000-0000-0000-000000000000',
    'ai-agent',
    'interrealm/ai-agent',
    'v1.0.0',
    'pending'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample routing policies
INSERT INTO routing_policies (source_realm_id, target_realm_id, allowed, direct_bridge)
VALUES
  (
    'realm://org.00000000-0000-0000-0000-000000000000.gateway-api',
    'realm://org.00000000-0000-0000-0000-000000000000.ai-assistant',
    true,
    false
  ),
  (
    'realm://org.00000000-0000-0000-0000-000000000000.ai-assistant',
    'realm://org.00000000-0000-0000-0000-000000000000.bridge-main',
    true,
    true
  )
ON CONFLICT DO NOTHING;