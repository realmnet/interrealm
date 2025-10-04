import React from 'react';
import { Globe, Users, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Realm {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  region: string;
  services: number;
  users: number;
  lastSync: string;
}

const realms: Realm[] = [
  {
    id: '1',
    name: 'production-east',
    status: 'active',
    region: 'US East',
    services: 24,
    users: 1250,
    lastSync: '2 min ago',
  },
  {
    id: '2',
    name: 'production-west',
    status: 'active',
    region: 'US West',
    services: 18,
    users: 890,
    lastSync: '5 min ago',
  },
  {
    id: '3',
    name: 'staging',
    status: 'maintenance',
    region: 'EU Central',
    services: 12,
    users: 45,
    lastSync: '1 hour ago',
  },
  {
    id: '4',
    name: 'development',
    status: 'active',
    region: 'US Central',
    services: 8,
    users: 23,
    lastSync: '30 sec ago',
  },
];

export const RealmsTab: React.FC = () => {
  const getStatusBadge = (status: Realm['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">Active Realms</h2>
          <p className="text-sm text-muted-foreground">Manage and monitor your realm deployments</p>
        </div>
        <Button>
          <Globe className="mr-2 h-4 w-4" />
          Create Realm
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {realms.map((realm) => (
          <div
            key={realm.id}
            className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{realm.name}</h3>
                <p className="text-sm text-muted-foreground">{realm.region}</p>
              </div>
              {getStatusBadge(realm.status)}
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">Services</span>
                <span className="font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {realm.services}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">Users</span>
                <span className="font-medium flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {realm.users}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">Last Sync</span>
                <span className="font-medium flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {realm.lastSync}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                View Details
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Configure
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Realm synchronization is running. Last global sync completed 2 minutes ago.
          </span>
        </div>
      </div>
    </div>
  );
};