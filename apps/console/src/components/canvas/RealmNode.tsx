import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RealmNode as RealmNodeType } from '@interrealm/types';
import { Server, Shield, Cpu } from 'lucide-react';

const RealmNode = memo(({ data }: NodeProps<RealmNodeType>) => {
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

  const getIcon = () => {
    switch (data.type) {
      case 'gateway':
        return <Shield className="w-4 h-4" />;
      case 'bridge':
        return <Cpu className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const statusColor = getStatusColor();

  return (
    <Card className="p-3 min-w-[200px] shadow-lg border-2 hover:shadow-xl transition-shadow bg-white dark:bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-semibold text-sm text-gray-900">{data.name}</h3>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
      </div>

      <Badge variant={data.status === 'running' ? 'default' : 'secondary'} className="mb-2">
        {data.status || 'unknown'}
      </Badge>

      {data.contract?.inputs && data.contract.inputs.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs font-medium text-gray-600">Inputs:</p>
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
                }}
              />
              <div className="text-xs pl-2 flex items-center gap-1">
                <span className={input.satisfied ? 'text-green-600' : 'text-red-600'}>
                  {input.required ? '●' : '○'}
                </span>
                <span>{input.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.contract?.outputs && data.contract.outputs.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs font-medium text-gray-600">Outputs:</p>
          {data.contract.outputs.map((output) => (
            <div key={output.id} className="relative">
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                style={{
                  background: '#3b82f6',
                  right: -8,
                  top: '50%',
                }}
              />
              <div className="text-xs pr-2 text-right">
                {output.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
});

RealmNode.displayName = 'RealmNode';

export default RealmNode;