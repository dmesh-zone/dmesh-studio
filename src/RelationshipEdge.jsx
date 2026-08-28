
import React from 'react';
import { getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';

export default function RelationshipEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}) {
    // Use global hover state from Flow.jsx
    const isHovered = data?.isHovered;

    // Grid track routing: each edge gets its own dedicated "lane" in the gap and unique turn offsets.
    const isSameRow = data?.isSameRow;
    const isRightToLeft = targetX < (sourceX - 20);
    const isLongDistance = data?.isLongDistance;

    // We only force a detour into the gap if the path would otherwise cross a node body.
    // This minimizes elbows as requested by the user.
    const shouldGoAround = (isSameRow && isRightToLeft) || isLongDistance;

    const centerY = shouldGoAround
        ? (data?.gapCenterY + (data?.gapOffset || 0))
        : undefined;

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 10,
        // Unique stepOffset per edge ensures parallel vertical segments
        offset: data?.stepOffset || 50,
        centerY,
    });

    // Description from data, generated in Flow.jsx
    const description = data?.description || 'Relationship';

    return (
        <g className="react-flow__edge-relationship-group">
            {/* The actual visible edge */}
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: isHovered ? 3 : 1.5,
                    stroke: isHovered ? '#2563eb' : style.stroke || '#94a3b8',
                    transition: 'stroke-width 0.2s, stroke 0.2s',
                    opacity: isHovered ? 1 : 0.8,
                }}
            />

            {/* Thicker hit area for interaction. 
                In Safari, using a transparent stroke on a path with pointer-events: all 
                is the most reliable way to create a large hit area. 
                We don't add event listeners here; we let them bubble to the React Flow edge container. */}
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={40}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
            />

            {/* Tooltip on hover */}
            {isHovered && (
                <EdgeLabelRenderer>
                    <div
                        className="nopan nodrag"
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            background: '#0f172a', // Slightly darker for contrast
                            color: 'white',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            pointerEvents: 'none',
                            zIndex: 100000, // Absolute maximum priority
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                            whiteSpace: 'nowrap',
                            border: '1px solid #3b82f6',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {description}
                    </div>
                </EdgeLabelRenderer>
            )}
        </g>
    );
}
