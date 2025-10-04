import { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RealmCanvas, RealmNode, RealmEdge } from '@interrealm/types';
import { cn } from '@/lib/utils';

interface RealmExplorerProps {
  canvas?: RealmCanvas;
}

export function RealmExplorer({ canvas }: RealmExplorerProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const initialNodes: Node[] = canvas?.nodes.map((node: RealmNode & { meta: any }) => ({
    id: node.id,
    position: { x: node.meta.x, y: node.meta.y },
    data: {
      label: node.name,
      ...node.data
    },
    type: 'default',
    style: {
      backgroundColor: node.meta.color || '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '10px',
      minWidth: '150px'
    }
  })) || [];

  const initialEdges: Edge[] = canvas?.edges.map((edge: RealmEdge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'default',
    animated: edge.animated,
    label: edge.label
  })) || [];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  }, []);

  return (
    <div className="relative flex h-full w-full">
      <div className={cn(
        "flex-1 transition-all duration-300",
        isPanelOpen ? "mr-80" : "mr-0"
      )}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => node.style?.backgroundColor || '#fff'}
            style={{
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd'
            }}
          />
          <Panel position="top-left" className="bg-background/80 backdrop-blur-sm p-2 rounded-md">
            <div className="text-sm text-muted-foreground">
              {canvas?.lastUpdated ? `Last updated: ${new Date(canvas.lastUpdated).toLocaleString()}` : 'No data'}
            </div>
          </Panel>
        </ReactFlow>
      </div>

      <div className={cn(
        "absolute right-0 top-0 h-full bg-background border-l transition-all duration-300",
        isPanelOpen ? "w-80" : "w-0"
      )}>
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={cn(
            "absolute -left-8 top-1/2 -translate-y-1/2",
            "bg-background border rounded-l-md p-2 hover:bg-accent",
            "transition-all duration-200"
          )}
        >
          {isPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {isPanelOpen && (
          <div className="p-4 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-mono text-sm">{selectedNode.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Label</p>
                  <p className="text-sm">{selectedNode.data.label}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p className="font-mono text-sm">
                    x: {Math.round(selectedNode.position.x)}, y: {Math.round(selectedNode.position.y)}
                  </p>
                </div>
                {selectedNode.data && Object.keys(selectedNode.data).length > 1 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Additional Data</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(selectedNode.data).filter(([key]) => key !== 'label')
                        ),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a node to view details</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}