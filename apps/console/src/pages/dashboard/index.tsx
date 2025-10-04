import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { StatusTab } from './status-tab';
import { RealmsTab } from './realms-tab';
import { PoliciesTab } from './policies-tab';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
        <h1 className="text-3xl font-bold mt-4">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Realm Mesh infrastructure
        </p>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="realms">Realms</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <StatusTab />
        </TabsContent>

        <TabsContent value="realms" className="space-y-4">
          <RealmsTab />
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <PoliciesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};