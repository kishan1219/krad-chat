import React, { useState, useRef, useEffect, MouseEvent } from 'react'
import {
    Button,
    Badge,
    UncontrolledTooltip,
    ButtonGroup
} from 'reactstrap'
import {
    Plus,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Play,
    Save,
    UploadCloud,
    MessageSquare,
    Image,
    Clock,
    Zap,
    Users,
    Sliders,
    Trash2,
    Check,
    Layers,
    Move
} from 'react-feather'
import { FlowNode, FlowEdge, FlowNodeType } from './flowTypes'
import NodeInspector from './NodeInspector'
import FlowSimulatorModal from './FlowSimulatorModal'

interface VisualFlowCanvasProps {
    nodes: FlowNode[]
    edges: FlowEdge[]
    onNodesChange: (nodes: FlowNode[]) => void
    onEdgesChange: (edges: FlowEdge[]) => void
    onSaveDraft: () => Promise<void>
    onPublish: () => Promise<void>
    isSaving?: boolean
}

export default function VisualFlowCanvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onSaveDraft,
    onPublish,
    isSaving = false
}: VisualFlowCanvasProps) {
    // Pan & Zoom state
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const panStart = useRef({ x: 0, y: 0 })

    // Node Drag state
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
    const dragOffset = useRef({ x: 0, y: 0 })

    // Edge Creation state
    const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; handleId?: string } | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    // Selection & Modals
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)

    const canvasRef = useRef<HTMLDivElement>(null)

    // Node colors & icons map
    const nodeMeta: Record<FlowNodeType, { color: string; bg: string; icon: any; title: string }> = {
        trigger: { color: '#059669', bg: '#ecfdf5', icon: Zap, title: 'Inbound Trigger' },
        text: { color: '#2563eb', bg: '#eff6ff', icon: MessageSquare, title: 'WhatsApp Text' },
        media: { color: '#7c3aed', bg: '#f5f3ff', icon: Image, title: 'Media Message' },
        buttons: { color: '#0891b2', bg: '#ecfeff', icon: Sliders, title: 'Quick Reply Buttons' },
        list: { color: '#d97706', bg: '#fffbeb', icon: Layers, title: 'Interactive List Menu' },
        wait: { color: '#4b5563', bg: '#f3f4f6', icon: Clock, title: 'Wait Delay' },
        condition: { color: '#ea580c', bg: '#fff7ed', icon: Sliders, title: 'Condition Filter' },
        business_hours: { color: '#0d9488', bg: '#f0fdfa', icon: Clock, title: 'Business Hours' },
        handoff: { color: '#dc2626', bg: '#fef2f2', icon: Users, title: 'Human Handoff' }
    }

    // Canvas Mouse Down: Start Pan if clicking background
    const handleCanvasMouseDown = (e: MouseEvent) => {
        if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-background')) {
            setIsPanning(true)
            panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
            setSelectedNodeId(null)
            setConnectingFrom(null)
        }
    }

    // Canvas Mouse Move: Update Pan or Dragged Node
    const handleCanvasMouseMove = (e: MouseEvent) => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            setMousePos({
                x: (e.clientX - rect.left - pan.x) / zoom,
                y: (e.clientY - rect.top - pan.y) / zoom
            })
        }

        if (isPanning) {
            setPan({
                x: e.clientX - panStart.current.x,
                y: e.clientY - panStart.current.y
            })
        } else if (draggingNodeId) {
            const updated = nodes.map(n => {
                if (n.id === draggingNodeId) {
                    return {
                        ...n,
                        x: Math.round((e.clientX - dragOffset.current.x) / zoom),
                        y: Math.round((e.clientY - dragOffset.current.y) / zoom)
                    }
                }
                return n
            })
            onNodesChange(updated)
        }
    }

    // Canvas Mouse Up
    const handleCanvasMouseUp = () => {
        setIsPanning(false)
        setDraggingNodeId(null)
    }

    // Node Mouse Down: Start Node Drag
    const handleNodeMouseDown = (e: MouseEvent, nodeId: string) => {
        e.stopPropagation()
        setSelectedNodeId(nodeId)
        const node = nodes.find(n => n.id === nodeId)
        if (node) {
            setDraggingNodeId(nodeId)
            dragOffset.current = {
                x: e.clientX - node.x * zoom,
                y: e.clientY - node.y * zoom
            }
        }
    }

    // Start connection from an output port
    const handleStartConnection = (e: MouseEvent, nodeId: string, handleId?: string) => {
        e.stopPropagation()
        setConnectingFrom({ nodeId, handleId })
    }

    // Finish connection on a target input port
    const handleEndConnection = (e: MouseEvent, targetNodeId: string) => {
        e.stopPropagation()
        if (!connectingFrom || connectingFrom.nodeId === targetNodeId) {
            setConnectingFrom(null)
            return
        }

        // Check if edge already exists
        const exists = edges.some(
            edge =>
                edge.source === connectingFrom.nodeId &&
                edge.target === targetNodeId &&
                edge.sourceHandle === connectingFrom.handleId
        )

        if (!exists) {
            const newEdge: FlowEdge = {
                id: `edge-${connectingFrom.nodeId}-${connectingFrom.handleId || 'def'}-${targetNodeId}`,
                source: connectingFrom.nodeId,
                sourceHandle: connectingFrom.handleId,
                target: targetNodeId
            }
            onEdgesChange([...edges, newEdge])
        }

        setConnectingFrom(null)
    }

    // Delete edge
    const handleDeleteEdge = (edgeId: string) => {
        onEdgesChange(edges.filter(e => e.id !== edgeId))
    }

    // Add a new node to the center of canvas
    const handleAddNode = (type: FlowNodeType) => {
        const id = `node-${Date.now().toString().slice(-6)}`
        const centerX = Math.round(-pan.x / zoom + 350 + Math.random() * 80)
        const centerY = Math.round(-pan.y / zoom + 200 + Math.random() * 80)

        let initialData: any = { label: nodeMeta[type].title }
        if (type === 'text') {
            initialData.text = 'Hello! Welcome to our WhatsApp service.'
        } else if (type === 'buttons') {
            initialData.text = 'Please select how we can assist you:'
            initialData.buttons = ['View Catalog', 'Book Consultation', 'Support']
        } else if (type === 'list') {
            initialData.listButtonText = 'Select Option'
            initialData.listTitle = 'Services Menu'
            initialData.listRows = [
                { id: '1', title: 'Pricing & Plans', description: 'Explore enterprise pricing' },
                { id: '2', title: 'Schedule Demo', description: 'Speak with our technical architect' },
                { id: '3', title: 'Customer Support', description: 'Open a priority support ticket' }
            ]
        } else if (type === 'wait') {
            initialData.waitDuration = 24
            initialData.waitUnit = 'hours'
        } else if (type === 'media') {
            initialData.mediaType = 'image'
            initialData.mediaUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'
            initialData.caption = 'Here is your requested catalogue.'
        } else if (type === 'condition') {
            initialData.conditionField = 'message'
            initialData.conditionEquals = 'yes'
        }

        const newNode: FlowNode = {
            id,
            type,
            x: centerX,
            y: centerY,
            data: initialData
        }

        onNodesChange([...nodes, newNode])
        setSelectedNodeId(id)
    }

    // Delete Node
    const handleDeleteNode = (nodeId: string) => {
        if (nodeId === 'node-trigger') return
        onNodesChange(nodes.filter(n => n.id !== nodeId))
        onEdgesChange(edges.filter(e => e.source !== nodeId && e.target !== nodeId))
        if (selectedNodeId === nodeId) setSelectedNodeId(null)
    }

    // Calculate Bezier curve path
    const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
        const dx = Math.abs(x2 - x1) * 0.5
        const p1x = x1 + Math.max(dx, 40)
        const p1y = y1
        const p2x = x2 - Math.max(dx, 40)
        const p2y = y2
        return `M ${x1} ${y1} C ${p1x} ${p1y}, ${p2x} ${p2y}, ${x2} ${y2}`
    }

    // Node dimensions helper
    const getNodePortCoordinates = (node: FlowNode, handleId?: string, isInput = false) => {
        const width = 260
        if (isInput) {
            return { x: node.x, y: node.y + 40 }
        }
        // Output coordinates
        if (handleId && handleId.startsWith('btn-')) {
            const idx = parseInt(handleId.replace('btn-', ''))
            return { x: node.x + width, y: node.y + 90 + idx * 32 }
        }
        if (handleId && handleId.startsWith('row-')) {
            const idx = parseInt(handleId.replace('row-', ''))
            return { x: node.x + width, y: node.y + 90 + idx * 36 }
        }
        return { x: node.x + width, y: node.y + 40 }
    }

    const selectedNode = nodes.find(n => n.id === selectedNodeId) || null

    return (
        <div
            className='visual-flow-builder position-relative overflow-hidden'
            style={{
                height: '750px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                userSelect: 'none'
            }}
        >
            {/* TOP ACTION TOOLBAR */}
            <div
                className='position-absolute top-0 start-0 end-0 p-1 bg-white border-bottom d-flex flex-wrap justify-content-between align-items-center gap-1'
                style={{ zIndex: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
                {/* Node Creation Palette */}
                <div className='d-flex flex-wrap align-items-center gap-50'>
                    <span className='small fw-bold text-muted me-50'>Add Steps:</span>
                    <Button
                        size='sm'
                        color='primary'
                        outline
                        className='d-inline-flex align-items-center gap-25 py-25 px-50'
                        onClick={() => handleAddNode('text')}
                    >
                        <MessageSquare size={13} /> + Text
                    </Button>
                    <Button
                        size='sm'
                        color='info'
                        outline
                        className='d-inline-flex align-items-center gap-25 py-25 px-50'
                        onClick={() => handleAddNode('buttons')}
                    >
                        <Sliders size={13} /> + Quick Buttons
                    </Button>
                    <Button
                        size='sm'
                        color='warning'
                        outline
                        className='d-inline-flex align-items-center gap-25 py-25 px-50'
                        onClick={() => handleAddNode('list')}
                    >
                        <Layers size={13} /> + List Menu
                    </Button>
                    <Button
                        size='sm'
                        color='secondary'
                        outline
                        className='d-inline-flex align-items-center gap-25 py-25 px-50'
                        onClick={() => handleAddNode('wait')}
                    >
                        <Clock size={13} /> + Wait Delay
                    </Button>
                    <Button
                        size='sm'
                        color='primary'
                        outline
                        className='d-inline-flex align-items-center gap-25 py-25 px-50'
                        onClick={() => handleAddNode('media')}
                    >
                        <Image size={13} /> + Media
                    </Button>
                    <Button
                        size='sm'
                        color='danger'
                        outline
                        className='d-inline-flex align-items-center gap-25 py-25 px-50'
                        onClick={() => handleAddNode('handoff')}
                    >
                        <Users size={13} /> + Handoff
                    </Button>
                </div>

                {/* Canvas Controls & Execution Actions */}
                <div className='d-flex align-items-center gap-1 ms-auto'>
                    <ButtonGroup size='sm'>
                        <Button color='flat-secondary' onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title='Zoom Out'>
                            <ZoomOut size={15} />
                        </Button>
                        <Button color='flat-secondary' disabled className='small fw-bold px-50'>
                            {Math.round(zoom * 100)}%
                        </Button>
                        <Button color='flat-secondary' onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} title='Zoom In'>
                            <ZoomIn size={15} />
                        </Button>
                        <Button color='flat-secondary' onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} title='Reset View'>
                            <Maximize2 size={15} />
                        </Button>
                    </ButtonGroup>

                    <Button
                        size='sm'
                        color='outline-success'
                        className='d-inline-flex align-items-center gap-50 py-25 px-75'
                        onClick={() => setIsSimulatorOpen(true)}
                    >
                        <Play size={14} /> Test in Simulator
                    </Button>

                    <Button
                        size='sm'
                        color='primary'
                        disabled={isSaving}
                        className='d-inline-flex align-items-center gap-50 py-25 px-75'
                        onClick={() => void onSaveDraft()}
                    >
                        <Save size={14} /> {isSaving ? 'Saving...' : 'Save Draft'}
                    </Button>

                    <Button
                        size='sm'
                        color='success'
                        disabled={isSaving}
                        className='d-inline-flex align-items-center gap-50 py-25 px-75'
                        onClick={() => void onPublish()}
                    >
                        <UploadCloud size={14} /> Publish & Activate
                    </Button>
                </div>
            </div>

            {/* MAIN INTERACTIVE CANVAS */}
            <div
                ref={canvasRef}
                className='canvas-background w-100 h-100 position-relative'
                style={{
                    cursor: isPanning ? 'grabbing' : 'grab',
                    backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
                    backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
            >
                {/* SVG CONNECTION LAYER */}
                <svg
                    className='position-absolute top-0 start-0 w-100 h-100'
                    style={{ pointerEvents: 'none', zIndex: 10 }}
                >
                    <defs>
                        <linearGradient id='edge-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                            <stop offset='0%' stopColor='#10b981' />
                            <stop offset='100%' stopColor='#059669' />
                        </linearGradient>
                        <filter id='edge-glow' x='-20%' y='-20%' width='140%' height='140%'>
                            <feDropShadow dx='0' dy='2' stdDeviation='3' floodColor='#10b981' floodOpacity='0.25' />
                        </filter>
                    </defs>

                    {/* Render saved edges */}
                    {edges.map(edge => {
                        const sourceNode = nodes.find(n => n.id === edge.source)
                        const targetNode = nodes.find(n => n.id === edge.target)
                        if (!sourceNode || !targetNode) return null

                        const p1 = getNodePortCoordinates(sourceNode, edge.sourceHandle, false)
                        const p2 = getNodePortCoordinates(targetNode, undefined, true)

                        const sx = p1.x * zoom + pan.x
                        const sy = p1.y * zoom + pan.y
                        const tx = p2.x * zoom + pan.x
                        const ty = p2.y * zoom + pan.y

                        const d = getBezierPath(sx, sy, tx, ty)
                        const midX = (sx + tx) / 2
                        const midY = (sy + ty) / 2

                        return (
                            <g key={edge.id} className='flow-edge-group'>
                                <path
                                    d={d}
                                    fill='none'
                                    stroke='url(#edge-gradient)'
                                    strokeWidth={3 * zoom}
                                    strokeLinecap='round'
                                    filter='url(#edge-glow)'
                                />
                                {/* Pulsing particle */}
                                <circle cx={midX} cy={midY} r={4 * zoom} fill='#059669' />
                                {/* Edge delete trigger */}
                                <g
                                    transform={`translate(${midX - 10}, ${midY - 10})`}
                                    style={{ pointerEvents: 'all', cursor: 'pointer' }}
                                    onClick={() => handleDeleteEdge(edge.id)}
                                >
                                    <circle cx='10' cy='10' r='10' fill='#ef4444' opacity='0.9' />
                                    <line x1='6' y1='6' x2='14' y2='14' stroke='#FFF' strokeWidth='1.8' strokeLinecap='round' />
                                    <line x1='14' y1='6' x2='6' y2='14' stroke='#FFF' strokeWidth='1.8' strokeLinecap='round' />
                                </g>
                            </g>
                        )
                    })}

                    {/* Render in-progress drawing connection */}
                    {connectingFrom && (
                        (() => {
                            const sourceNode = nodes.find(n => n.id === connectingFrom.nodeId)
                            if (!sourceNode) return null
                            const p1 = getNodePortCoordinates(sourceNode, connectingFrom.handleId, false)
                            const sx = p1.x * zoom + pan.x
                            const sy = p1.y * zoom + pan.y
                            const tx = mousePos.x * zoom + pan.x
                            const ty = mousePos.y * zoom + pan.y
                            return (
                                <path
                                    d={getBezierPath(sx, sy, tx, ty)}
                                    fill='none'
                                    stroke='#3b82f6'
                                    strokeWidth={2.5 * zoom}
                                    strokeDasharray='5 5'
                                />
                            )
                        })()
                    )}
                </svg>

                {/* RENDER NODE CARDS */}
                {nodes.map(node => {
                    const meta = nodeMeta[node.type] || nodeMeta.text
                    const IconComp = meta.icon
                    const isSelected = selectedNodeId === node.id

                    return (
                        <div
                            key={node.id}
                            className={`flow-node-card position-absolute shadow-sm ${isSelected ? 'selected' : ''}`}
                            style={{
                                left: `${node.x * zoom + pan.x}px`,
                                top: `${node.y * zoom + pan.y}px`,
                                width: `${260 * zoom}px`,
                                zIndex: isSelected ? 25 : 15,
                                backgroundColor: '#FFFFFF',
                                borderRadius: `${12 * zoom}px`,
                                border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                transformOrigin: 'top left',
                                cursor: 'move',
                                transition: draggingNodeId === node.id ? 'none' : 'box-shadow 0.15s ease'
                            }}
                            onMouseDown={e => handleNodeMouseDown(e, node.id)}
                            onClick={e => { e.stopPropagation(); setSelectedNodeId(node.id) }}
                        >
                            {/* Input Port Handle (Left) */}
                            {node.type !== 'trigger' && (
                                <div
                                    className='port-handle input-port position-absolute'
                                    style={{
                                        left: `-${8 * zoom}px`,
                                        top: `${32 * zoom}px`,
                                        width: `${16 * zoom}px`,
                                        height: `${16 * zoom}px`,
                                        borderRadius: '50%',
                                        backgroundColor: '#3b82f6',
                                        border: '2.5px solid #FFFFFF',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                        cursor: 'crosshair',
                                        zIndex: 30
                                    }}
                                    onClick={e => handleEndConnection(e, node.id)}
                                    title='Click to connect input'
                                />
                            )}

                            {/* Node Header */}
                            <div
                                className='p-1 d-flex align-items-center justify-content-between rounded-top'
                                style={{ backgroundColor: meta.bg, borderBottom: '1px solid #e2e8f0' }}
                            >
                                <div className='d-flex align-items-center gap-1 overflow-hidden'>
                                    <div
                                        style={{
                                            width: `${26 * zoom}px`,
                                            height: `${26 * zoom}px`,
                                            borderRadius: '6px',
                                            backgroundColor: meta.color,
                                            color: '#FFF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <IconComp size={14 * zoom} />
                                    </div>
                                    <div className='overflow-hidden'>
                                        <div
                                            className='fw-bold text-truncate'
                                            style={{ fontSize: `${12 * zoom}px`, color: '#1e293b' }}
                                        >
                                            {node.data.label || meta.title}
                                        </div>
                                    </div>
                                </div>

                                {node.type !== 'trigger' && (
                                    <button
                                        type='button'
                                        className='btn btn-sm btn-icon p-0 border-0 bg-transparent text-muted'
                                        onClick={e => { e.stopPropagation(); handleDeleteNode(node.id) }}
                                        title='Delete step'
                                    >
                                        <Trash2 size={13 * zoom} />
                                    </button>
                                )}
                            </div>

                            {/* Node Body Content Preview */}
                            <div className='p-1' style={{ fontSize: `${11 * zoom}px`, color: '#475569' }}>
                                {node.type === 'trigger' && (
                                    <div>
                                        <Badge color='light-success' pill className='mb-25'>
                                            {node.data.triggerKind === 'keyword'
                                                ? `Keyword: ${node.data.keyword || 'HELP'}`
                                                : node.data.triggerKind === 'new_contact'
                                                ? 'First Inbound Message'
                                                : 'Any Inbound Message'}
                                        </Badge>
                                        <div className='small text-muted'>Starts conversational flow</div>
                                    </div>
                                )}

                                {node.type === 'text' && (
                                    <div className='text-truncate-2' style={{ whiteSpace: 'pre-wrap' }}>
                                        {node.data.text || 'No text set...'}
                                    </div>
                                )}

                                {node.type === 'media' && (
                                    <div>
                                        <span className='fw-bold text-primary'>[{node.data.mediaType || 'Image'}]</span>
                                        <div className='text-truncate small text-muted'>{node.data.mediaUrl || 'No URL configured'}</div>
                                    </div>
                                )}

                                {node.type === 'wait' && (
                                    <div className='d-flex align-items-center gap-50'>
                                        <Clock size={12 * zoom} />
                                        <span>Delay <strong>{node.data.waitDuration || 1} {node.data.waitUnit || 'hours'}</strong></span>
                                    </div>
                                )}

                                {node.type === 'handoff' && (
                                    <div className='text-danger small fw-bold'>
                                        Transfers to Human Agent Queue
                                    </div>
                                )}

                                {/* Interactive Buttons Branch List with discrete output ports */}
                                {node.type === 'buttons' && (
                                    <div className='mt-25'>
                                        <div className='text-truncate small mb-50'>{node.data.text}</div>
                                        {(node.data.buttons || []).map((btn, idx) => (
                                            <div
                                                key={idx}
                                                className='d-flex align-items-center justify-content-between p-25 px-50 border rounded mb-25 position-relative'
                                                style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}
                                            >
                                                <span className='small fw-bold text-success text-truncate'>
                                                    {idx + 1}. {btn}
                                                </span>
                                                <div
                                                    className='port-handle output-port position-absolute'
                                                    style={{
                                                        right: `-${8 * zoom}px`,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: `${14 * zoom}px`,
                                                        height: `${14 * zoom}px`,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#10b981',
                                                        border: '2px solid #FFFFFF',
                                                        cursor: 'crosshair',
                                                        zIndex: 30
                                                    }}
                                                    onClick={e => handleStartConnection(e, node.id, `btn-${idx}`)}
                                                    title={`Connect "${btn}" reply branch`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Interactive List Rows with discrete output ports */}
                                {node.type === 'list' && (
                                    <div className='mt-25'>
                                        <div className='fw-bold small text-warning mb-25'>{node.data.listButtonText || 'Select Option'}</div>
                                        {(node.data.listRows || []).slice(0, 3).map((row, idx) => (
                                            <div
                                                key={idx}
                                                className='d-flex align-items-center justify-content-between p-25 px-50 border rounded mb-25 position-relative'
                                                style={{ backgroundColor: '#fffbeb', borderColor: '#fef3c7' }}
                                            >
                                                <span className='small text-truncate'>{row.title}</span>
                                                <div
                                                    className='port-handle output-port position-absolute'
                                                    style={{
                                                        right: `-${8 * zoom}px`,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: `${14 * zoom}px`,
                                                        height: `${14 * zoom}px`,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#f59e0b',
                                                        border: '2px solid #FFFFFF',
                                                        cursor: 'crosshair',
                                                        zIndex: 30
                                                    }}
                                                    onClick={e => handleStartConnection(e, node.id, `row-${idx}`)}
                                                    title={`Connect "${row.title}" reply branch`}
                                                />
                                            </div>
                                        ))}
                                        {(node.data.listRows || []).length > 3 && (
                                            <div className='small text-muted text-center'>
                                                + {node.data.listRows!.length - 3} more options
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Standard Output Port Handle (for non-buttons / non-list nodes) */}
                            {!['buttons', 'list'].includes(node.type) && (
                                <div
                                    className='port-handle output-port position-absolute'
                                    style={{
                                        right: `-${8 * zoom}px`,
                                        top: `${32 * zoom}px`,
                                        width: `${16 * zoom}px`,
                                        height: `${16 * zoom}px`,
                                        borderRadius: '50%',
                                        backgroundColor: '#10b981',
                                        border: '2.5px solid #FFFFFF',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                        cursor: 'crosshair',
                                        zIndex: 30
                                    }}
                                    onClick={e => handleStartConnection(e, node.id)}
                                    title='Click to connect output to next step'
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* NODE INSPECTOR DRAWER */}
            {selectedNode && (
                <NodeInspector
                    node={selectedNode}
                    onUpdate={updated => {
                        onNodesChange(nodes.map(n => (n.id === updated.id ? updated : n)))
                    }}
                    onDelete={nodeId => handleDeleteNode(nodeId)}
                    onClose={() => setSelectedNodeId(null)}
                />
            )}

            {/* LIVE WHATSAPP PHONE SIMULATOR */}
            <FlowSimulatorModal
                isOpen={isSimulatorOpen}
                toggle={() => setIsSimulatorOpen(!isSimulatorOpen)}
                nodes={nodes}
                edges={edges}
            />
        </div>
    )
}
