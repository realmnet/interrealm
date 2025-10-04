import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Policy {
  id: string;
  name: string;
  type: 'security' | 'network' | 'access' | 'data';
  status: 'active' | 'draft' | 'violated';
  appliedTo: number;
  lastModified: string;
  violations: number;
}

const policies: Policy[] = [
  {
    id: '1',
    name: 'Zero Trust Network Access',
    type: 'security',
    status: 'active',
    appliedTo: 12,
    lastModified: '2 days ago',
    violations: 0,
  },
  {
    id: '2',
    name: 'Data Encryption at Rest',
    type: 'data',
    status: 'active',
    appliedTo: 12,
    lastModified: '1 week ago',
    violations: 0,
  },
  {
    id: '3',
    name: 'Rate Limiting Policy',
    type: 'network',
    status: 'violated',
    appliedTo: 8,
    lastModified: '3 hours ago',
    violations: 2,
  },
  {
    id: '4',
    name: 'RBAC Configuration',
    type: 'access',
    status: 'active',
    appliedTo: 10,
    lastModified: '1 month ago',
    violations: 0,
  },
  {
    id: '5',
    name: 'Service Mesh TLS',
    type: 'security',
    status: 'draft',
    appliedTo: 0,
    lastModified: '10 min ago',
    violations: 0,
  },
];

export const PoliciesTab: React.FC = () => {
  const getPolicyIcon = (type: Policy['type']) => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'network':
        return <FileText className="h-4 w-4" />;
      case 'access':
        return <FileText className="h-4 w-4" />;
      case 'data':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIndicator = (status: Policy['status'], violations: number) => {
    if (status === 'violated') {
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{violations} violations</span>
        </div>
      );
    }
    if (status === 'draft') {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Draft</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Active</span>
      </div>
    );
  };

  const policyStats = {
    total: policies.length,
    active: policies.filter(p => p.status === 'active').length,
    violations: policies.reduce((acc, p) => acc + p.violations, 0),
    coverage: Math.round((policies.filter(p => p.status === 'active').length / 12) * 100),
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">Policy Management</h2>
          <p className="text-sm text-muted-foreground">Configure and monitor security and operational policies</p>
        </div>
        <Button>
          <Shield className="mr-2 h-4 w-4" />
          Create Policy
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Policies</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold mt-2">{policyStats.total}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold mt-2">{policyStats.active}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Violations</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold mt-2">{policyStats.violations}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Coverage</span>
            <Shield className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-2">{policyStats.coverage}%</div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Policy</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Applied To</th>
                <th className="text-left p-4 font-medium">Last Modified</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id} className="border-b hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getPolicyIcon(policy.type)}
                      <span className="font-medium">{policy.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize text-sm text-muted-foreground">{policy.type}</span>
                  </td>
                  <td className="p-4">
                    {getStatusIndicator(policy.status, policy.violations)}
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{policy.appliedTo} realms</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{policy.lastModified}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      {policy.status === 'violated' && (
                        <Button size="sm" variant="destructive">Review</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};