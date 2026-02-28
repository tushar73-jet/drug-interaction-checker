import React, { useMemo } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const GraphView = ({ drugs, interactions }) => {
    // Generate nodes from the selected drugs
    const initialNodes = useMemo(() => {
        return drugs.map((drug, index) => {
            // Simple circular layout logic
            const radius = 150;
            const angle = (index / drugs.length) * 2 * Math.PI;
            // Center at x:250, y:150
            const x = 250 + radius * Math.cos(angle);
            const y = 150 + radius * Math.sin(angle);

            return {
                id: drug.name || drug, // Fallback in case drug is just a string
                position: { x, y },
                data: { label: drug.name || drug },
                style: {
                    background: '#ffffff',
                    color: '#1e293b',
                    border: '2px solid #4f46e5',
                    borderRadius: '8px',
                    padding: '10px 15px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                },
            };
        });
    }, [drugs]);

    // Generate edges based on interactions
    const initialEdges = useMemo(() => {
        return interactions.map((interaction, index) => {
            // Color-code the edges based on severity
            const severity = (interaction.severity || 'Moderate').toLowerCase();
            let color = '#f59e0b'; // Moderate (Orange)
            if (severity === 'major') color = '#ef4444'; // Major (Red)
            if (severity === 'minor') color = '#10b981'; // Minor (Green)

            return {
                id: `e-${interaction.drug1}-${interaction.drug2}-${index}`,
                source: interaction.drug1,
                target: interaction.drug2,
                animated: true,
                style: { stroke: color, strokeWidth: 2 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 15,
                    height: 15,
                    color: color,
                },
            };
        });
    }, [interactions]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <div style={{ width: '100%', height: '400px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-left"
            >
                <MiniMap nodeStrokeColor="#4f46e5" nodeColor="#e0e7ff" />
                <Controls />
                <Background color="#cbd5e1" gap={16} />
            </ReactFlow>
        </div>
    );
};

export default GraphView;
