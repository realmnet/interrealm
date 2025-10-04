import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RealmNode as RealmNodeType, RealmEdge, RealmCanvas as RealmCanvasType } from '@interrealm/types';
import RealmNodeComponent from '@/components/canvas/RealmNode';
import UIRealmNode from '@/components/canvas/UIRealmNode';
import ServiceEdge from '@/components/canvas/ServiceEdge';
import EventEdge from '@/components/canvas/EventEdge';

const nodeTypes = {
  realm: RealmNodeComponent,
  'ui-realm': UIRealmNode,
  bridge: RealmNodeComponent,
  gateway: RealmNodeComponent,
};

const edgeTypes = {
  service: ServiceEdge,
  'event-producer': EventEdge,
  'event-consumer': EventEdge,
};

const mockRealmCanvas: RealmCanvasType = {
  nodes: [
    {
      id: 'ui-1',
      name: 'UI Realm',
      type: 'ui-realm',
      status: 'running',
      contract: {
        inputs: [
          { id: 'auth-service', name: 'Auth Service', type: 'service', required: true, satisfied: true },
          { id: 'user-events', name: 'User Events', type: 'event', required: false, satisfied: false }
        ],
        outputs: [
          { id: 'ui-events', name: 'UI Events', type: 'broadcast' }
        ]
      },
      inputsSatisfied: false,
      meta: { x: 100, y: 100 }
    },
    {
      id: 'auth-1',
      name: 'Auth Realm',
      type: 'realm',
      status: 'running',
      contract: {
        inputs: [
          { id: 'db-service', name: 'Database', type: 'service', required: true, satisfied: true }
        ],
        outputs: [
          { id: 'auth-service', name: 'Auth Service', type: 'service' },
          { id: 'auth-events', name: 'Auth Events', type: 'event' }
        ]
      },
      inputsSatisfied: true,
      meta: { x: 400, y: 100 }
    },
    {
      id: 'db-1',
      name: 'Database Realm',
      type: 'realm',
      status: 'running',
      contract: {
        inputs: [],
        outputs: [
          { id: 'db-service', name: 'Database Service', type: 'service' },
          { id: 'db-events', name: 'DB Events', type: 'event' }
        ]
      },
      inputsSatisfied: true,
      meta: { x: 700, y: 100 }
    },
    {
      id: 'notification-1',
      name: 'Notification Realm',
      type: 'realm',
      status: 'pending',
      contract: {
        inputs: [
          { id: 'events', name: 'Events', type: 'event', required: true, satisfied: false },
          { id: 'email-service', name: 'Email Service', type: 'service', required: true, satisfied: false }
        ],
        outputs: [
          { id: 'notification-events', name: 'Notification Events', type: 'broadcast' }
        ]
      },
      inputsSatisfied: false,
      meta: { x: 400, y: 300 }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'auth-1',
      target: 'ui-1',
      sourceHandle: 'auth-service',
      targetHandle: 'auth-service',
      type: 'service',
      label: 'Auth Service',
      animated: true
    },
    {
      id: 'e2',
      source: 'db-1',
      target: 'auth-1',
      sourceHandle: 'db-service',
      targetHandle: 'db-service',
      type: 'service',
      label: 'Database',
      animated: true
    },
    {
      id: 'e3',
      source: 'auth-1',
      target: 'notification-1',
      sourceHandle: 'auth-events',
      targetHandle: 'events',
      type: 'event-producer',
      label: 'Auth Events'
    }
  ],
  lastUpdated: new Date().toISOString(),
  layout: 'freeform'
};

export default function RealmCanvas() {
  const [nodes, setNodes] = useState<Node[]>(
    mockRealmCanvas.nodes.map(node => ({
      id: node.id,
      type: node.type === 'ui-realm' ? 'ui-realm' : 'realm',
      position: { x: node.meta.x, y: node.meta.y },
      data: node,
    }))
  );

  const [edges, setEdges] = useState<Edge[]>(
    mockRealmCanvas.edges.map(edge => ({
      ...edge,
      markerEnd: { type: 'arrowClosed' as const, color: '#333' },
      style: {
        strokeWidth: 2,
        stroke: edge.type === 'service' ? '#10b981' : '#8b5cf6'
      }
    }))
  );

  const [, setCanvasState] = useState<RealmCanvasType>(mockRealmCanvas);

  useEffect(() => {
    console.log('Nodes:', nodes);
    console.log('Edges:', edges);
  }, [nodes, edges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e-${Date.now()}`,
        type: 'service',
        markerEnd: { type: 'arrowClosed' as const, color: '#333' },
        style: { strokeWidth: 2, stroke: '#10b981' },
        label: 'New Connection'
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );

  const saveCanvas = useCallback(() => {
    const updatedCanvas: RealmCanvasType = {
      nodes: nodes.map(node => ({
        ...node.data as RealmNodeType,
        meta: {
          x: node.position.x,
          y: node.position.y
        }
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        type: edge.type as RealmEdge['type'],
        label: edge.label as string | undefined,
        animated: edge.animated,
      })),
      lastUpdated: new Date().toISOString(),
      layout: 'freeform'
    };

    setCanvasState(updatedCanvas);
    console.log('Canvas saved:', updatedCanvas);
    localStorage.setItem('realm-canvas', JSON.stringify(updatedCanvas));
  }, [nodes, edges]);

  const loadCanvas = useCallback(() => {
    const saved = localStorage.getItem('realm-canvas');
    if (saved) {
      const canvas: RealmCanvasType = JSON.parse(saved);
      setNodes(
        canvas.nodes.map(node => ({
          id: node.id,
          type: node.type === 'ui-realm' ? 'ui-realm' : 'realm',
          position: { x: node.meta.x, y: node.meta.y },
          data: node,
        }))
      );
      setEdges(
        canvas.edges.map(edge => ({
          ...edge,
          markerEnd: { type: 'arrowClosed' as const, color: '#333' },
          style: {
            strokeWidth: 2,
            stroke: edge.type === 'service' ? '#10b981' : '#8b5cf6'
          }
        }))
      );
      setCanvasState(canvas);
    }
  }, []);

  const addMockRealm = useCallback(() => {
    const newNode: Node = {
      id: `realm-${Date.now()}`,
      type: 'realm',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: {
        id: `realm-${Date.now()}`,
        name: `New Realm ${nodes.length + 1}`,
        type: 'realm',
        status: 'pending',
        contract: {
          inputs: [
            { id: 'input-1', name: 'Service Input', type: 'service', required: true, satisfied: false }
          ],
          outputs: [
            { id: 'output-1', name: 'Service Output', type: 'service' }
          ]
        },
        inputsSatisfied: false,
      }
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        style={{ width: '100%', height: '100%' }}
        className="bg-gray-50 dark:bg-black"
      >
        <Background color="#444" className="dark:bg-black" />
        <Controls />
        <MiniMap />
        <Panel position="top-left">
          <Card className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Realm Canvas POC</h2>
            <div className="flex gap-2">
              <Button onClick={addMockRealm} size="sm">Add Realm</Button>
              <Button onClick={saveCanvas} size="sm" variant="outline">Save</Button>
              <Button onClick={loadCanvas} size="sm" variant="outline">Load</Button>
            </div>
          </Card>
        </Panel>
        <Panel position="top-right">
          <Card className="p-4 max-w-xs bg-white/90 dark:bg-gray-900/90 backdrop-blur">
            <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Legend</h3>
            <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>All inputs satisfied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Partial inputs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>No inputs satisfied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-500"></div>
                <span>Service connection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-purple-500"></div>
                <span>Event connection</span>
              </div>
            </div>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
}