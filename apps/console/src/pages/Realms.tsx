import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RealmExplorer } from '@/components/realms/RealmExplorer';
import { CreateRealmModal } from '@/components/realms/CreateRealmModal';
import type { DatabaseRealm } from '@interrealm/types';

export default function Realms() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [realms, setRealms] = useState<DatabaseRealm[]>([]);
  const [, setLoading] = useState(true);

  // Load existing realms (mocked for now)
  useEffect(() => {
    const loadRealms = async () => {
      // Mock data instead of API call
      const mockRealms: DatabaseRealm[] = [
        {
          id: 'realm-1',
          name: 'UI Realm',
          type: 'ui-realm',
          config: {},
          status: 'running',
          clusterId: 'cluster-1',
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'realm-2',
          name: 'Auth Service',
          type: 'realm',
          config: {},
          status: 'running',
          clusterId: 'cluster-1',
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'realm-3',
          name: 'Database Realm',
          type: 'realm',
          config: {},
          status: 'running',
          clusterId: 'cluster-1',
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setRealms(mockRealms);
      setLoading(false);
    };

    loadRealms();
  }, []);

  // Transform realms for the modal's parent realm selector
  const existingRealms = realms.map(realm => ({
    id: realm.id,
    name: realm.name
  }));

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="topology" className="flex flex-col h-full">
        {/* Compact Header with Tabs */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-12 items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <h1 className="text-lg font-semibold">Realms</h1>
              <TabsList className="h-8 bg-transparent border-0 p-0">
                <TabsTrigger
                  value="topology"
                  className="relative h-8 rounded-none border-b-2 border-transparent bg-transparent px-3 pb-1 pt-1 text-sm font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  Topology
                </TabsTrigger>
              </TabsList>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Realm
            </Button>
          </div>
        </div>

        {/* Full Height Content */}
        <TabsContent value="topology" className="flex-1 m-0 overflow-hidden">
          <RealmExplorer />
        </TabsContent>
      </Tabs>

      {/* Create Realm Modal */}
      <CreateRealmModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        existingRealms={existingRealms}
      />
    </div>
  );
}