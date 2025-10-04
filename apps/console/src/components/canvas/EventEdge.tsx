import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

const EventEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isProducer = data?.type === 'event-producer';
  const color = isProducer ? '#8b5cf6' : '#ec4899';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: 2,
          strokeDasharray: isProducer ? '0' : '5 5',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className="px-2 py-1 border rounded text-xs font-medium"
            style={{
              backgroundColor: isProducer ? '#ede9fe' : '#fce7f3',
              borderColor: isProducer ? '#a78bfa' : '#f9a8d4',
              color: isProducer ? '#6b21a8' : '#831843',
            }}
          >
            {label || (isProducer ? 'Event Producer' : 'Event Consumer')}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

EventEdge.displayName = 'EventEdge';

export default EventEdge;