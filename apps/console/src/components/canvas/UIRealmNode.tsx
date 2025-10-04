import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RealmNode as RealmNodeType } from '@interrealm/types';
import { Monitor, Palette } from 'lucide-react';

const UIRealmNode = memo(({ data }: NodeProps<RealmNodeType>) => {
  const getStatusColor = () => {
    if (data.inputsSatisfied === undefined) return 'bg-gray-500';
    if (data.inputsSatisfied) return 'bg-green-500';

    const hasInputs = data.contract?.inputs && data.contract.inputs.length > 0;
    if (!hasInputs) return 'bg-green-500';

    const satisfiedCount = data.contract?.inputs.filter(i => i.satisfied).length || 0;
    const totalRequired = data.contract?.inputs.filter(i => i.required).length || 0;

    if (satisfiedCount === 0) return 'bg-red-500';
    if (satisfiedCount < totalRequired) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const statusColor = getStatusColor();

  return (
    <Card className="p-3 min-w-[220px] shadow-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-white dark:to-purple-50 hover:shadow-2xl transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-purple-100 rounded">
            <Monitor className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-purple-900">{data.name}</h3>
            <p className="text-xs text-purple-600 flex items-center gap-1">
              <Palette className="w-3 h-3" />
              UI Component
            </p>
          </div>
        </div>
        <div className={`w-4 h-4 rounded-full ${statusColor} animate-pulse shadow-lg`} />
      </div>

      <Badge variant={data.status === 'running' ? 'default' : 'secondary'} className="mb-2 bg-purple-600">
        {data.status || 'unknown'}
      </Badge>

      {data.contract?.inputs && data.contract.inputs.length > 0 && (
        <div className="mt-2 space-y-1 bg-white/50 rounded p-2">
          <p className="text-xs font-medium text-purple-800">Required Services:</p>
          {data.contract.inputs.map((input) => (
            <div key={input.id} className="relative">
              <Handle
                type="target"
                position={Position.Left}
                id={input.id}
                style={{
                  background: input.satisfied ? '#10b981' : '#ef4444',
                  left: -8,
                  top: '50%',
                  width: 12,
                  height: 12,
                }}
              />
              <div className="text-xs pl-2 flex items-center gap-1">
                <span className={input.satisfied ? 'text-green-600' : 'text-red-600'}>
                  {input.required ? '●' : '○'}
                </span>
                <span className="text-purple-700">{input.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.contract?.outputs && data.contract.outputs.length > 0 && (
        <div className="mt-2 space-y-1 bg-white/50 rounded p-2">
          <p className="text-xs font-medium text-purple-800">Broadcasts:</p>
          {data.contract.outputs.map((output) => (
            <div key={output.id} className="relative">
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                style={{
                  background: '#8b5cf6',
                  right: -8,
                  top: '50%',
                  width: 12,
                  height: 12,
                }}
              />
              <div className="text-xs pr-2 text-right text-purple-700">
                {output.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
});

UIRealmNode.displayName = 'UIRealmNode';

export default UIRealmNode;