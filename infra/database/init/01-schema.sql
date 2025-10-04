-- InterRealm Database Schema
-- This script initializes the database schema for the InterRealm system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create realm_clusters table
CREATE TABLE realm_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kubeconfig TEXT,  -- encrypted connection details
  status TEXT CHECK (status IN ('active', 'offline', 'maintenance')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create realms table
CREATE TABLE realms (
  id TEXT PRIMARY KEY,  -- realm://org.cluster-id.realm-name
  name TEXT NOT NULL,
  cluster_id UUID NOT NULL REFERENCES realm_clusters(id) ON DELETE CASCADE,
  parent_realm_id TEXT REFERENCES realms(id),
  realm_type TEXT CHECK (realm_type IN ('bridge', 'internal', 'gateway', 'ai-agent')) NOT NULL,
  container_image TEXT NOT NULL,
  container_version TEXT DEFAULT 'latest',
  status TEXT CHECK (status IN ('pending', 'running', 'failed', 'stopped')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create routing_policies table
CREATE TABLE routing_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_realm_id TEXT NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  target_realm_id TEXT NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  via_realm_id TEXT REFERENCES realms(id),
  allowed BOOLEAN DEFAULT true,
  direct_bridge BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_realms_cluster ON realms(cluster_id);
CREATE INDEX idx_realms_parent ON realms(parent_realm_id);
CREATE INDEX idx_realms_type ON realms(realm_type);
CREATE INDEX idx_realms_status ON realms(status);
CREATE INDEX idx_routing_lookup ON routing_policies(source_realm_id, target_realm_id);
CREATE INDEX idx_routing_source ON routing_policies(source_realm_id);
CREATE INDEX idx_routing_target ON routing_policies(target_realm_id);