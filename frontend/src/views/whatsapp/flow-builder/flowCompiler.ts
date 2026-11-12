import { FlowNode, FlowEdge, FlowNodeType } from './flowTypes'

// Convert duration to seconds
function toSeconds(duration = 60, unit = 'seconds'): number {
    switch (unit) {
        case 'minutes': return Math.min(2592000, duration * 60)
        case 'hours': return Math.min(2592000, duration * 3600)
        case 'days': return Math.min(2592000, duration * 86400)
        default: return Math.min(2592000, Math.max(1, duration))
    }
}

// Convert seconds to human unit
export function fromSeconds(seconds = 60): { duration: number; unit: 'seconds' | 'minutes' | 'hours' | 'days' } {
    if (seconds >= 86400 && seconds % 86400 === 0) return { duration: seconds / 86400, unit: 'days' }
    if (seconds >= 3600 && seconds % 3600 === 0) return { duration: seconds / 3600, unit: 'hours' }
    if (seconds >= 60 && seconds % 60 === 0) return { duration: seconds / 60, unit: 'minutes' }
    return { duration: seconds, unit: 'seconds' }
}

export function compileFlowToSteps(nodes: FlowNode[], edges: FlowEdge[]): any[] {
    const steps: any[] = []
    const visited = new Set<string>()

    // Find trigger node
    const triggerNode = nodes.find(n => n.type === 'trigger') || nodes[0]
    if (!triggerNode) return [{ kind: 'text', text: 'Hello from KRAD Chat!' }]

    // Breadth/Depth-first traversal from trigger node
    function traverse(nodeId: string) {
        if (!nodeId || visited.has(nodeId)) return
        visited.add(nodeId)

        const node = nodes.find(n => n.id === nodeId)
        if (!node) return

        // Map node to backend step
        if (node.type === 'text') {
            steps.push({
                kind: 'text',
                text: node.data.text || 'Hello from KRAD Chat!'
            })
        } else if (node.type === 'media') {
            const caption = node.data.caption ? `\n${node.data.caption}` : ''
            steps.push({
                kind: 'text',
                text: `[${(node.data.mediaType || 'Image').toUpperCase()}] ${node.data.mediaUrl || ''}${caption}`
            })
        } else if (node.type === 'buttons') {
            // Interactive buttons message
            const btnList = (node.data.buttons || []).map((b, i) => `[${i + 1}] ${b}`).join('  ')
            steps.push({
                kind: 'text',
                text: `${node.data.text || 'Please select an option:'}\n${btnList}`
            })
        } else if (node.type === 'list') {
            const rows = (node.data.listRows || []).map((r, i) => `${i + 1}. ${r.title}${r.description ? ` - ${r.description}` : ''}`).join('\n')
            steps.push({
                kind: 'text',
                text: `${node.data.text || 'Options Menu:'}\n${rows}`
            })
        } else if (node.type === 'wait') {
            steps.push({
                kind: 'wait',
                seconds: toSeconds(node.data.waitDuration, node.data.waitUnit)
            })
        } else if (node.type === 'condition') {
            steps.push({
                kind: 'condition',
                field: node.data.conditionField || 'message',
                equals: node.data.conditionEquals || 'yes',
                ...(node.data.conditionKey ? { key: node.data.conditionKey } : {})
            })
        } else if (node.type === 'business_hours') {
            steps.push({
                kind: 'business_hours',
                timezone: node.data.timezone || 'Asia/Kolkata',
                days: node.data.days || [1, 2, 3, 4, 5],
                start: node.data.startTime || '09:00',
                end: node.data.endTime || '18:00'
            })
        } else if (node.type === 'handoff') {
            steps.push({ kind: 'handoff' })
        }

        // Follow edges
        // If buttons node, follow branches
        if (node.type === 'buttons' && (node.data.buttons || []).length > 0) {
            node.data.buttons.forEach((btn, idx) => {
                const handle = `btn-${idx}`
                const branchEdge = edges.find(e => e.source === node.id && e.sourceHandle === handle)
                if (branchEdge) {
                    steps.push({
                        kind: 'condition',
                        field: 'message',
                        equals: btn
                    })
                    traverse(branchEdge.target)
                }
            })
        } else if (node.type === 'list' && (node.data.listRows || []).length > 0) {
            node.data.listRows.forEach((row, idx) => {
                const handle = `row-${idx}`
                const branchEdge = edges.find(e => e.source === node.id && e.sourceHandle === handle)
                if (branchEdge) {
                    steps.push({
                        kind: 'condition',
                        field: 'message',
                        equals: row.title
                    })
                    traverse(branchEdge.target)
                }
            })
        } else {
            // General outgoing edges
            const nextEdges = edges.filter(e => e.source === node.id)
            nextEdges.forEach(e => traverse(e.target))
        }
    }

    // Traverse starting from children of trigger node
    const firstEdges = edges.filter(e => e.source === triggerNode.id)
    if (firstEdges.length > 0) {
        firstEdges.forEach(e => traverse(e.target))
    } else {
        // Linear fallback through remaining nodes
        nodes.filter(n => n.id !== triggerNode.id).forEach(n => traverse(n.id))
    }

    return steps.length > 0 ? steps.slice(0, 30) : [{ kind: 'text', text: 'Welcome to KRAD Chat!' }]
}

export function parseStepsToFlow(steps: any[], triggerKind = 'keyword', keyword = 'help'): { nodes: FlowNode[]; edges: FlowEdge[] } {
    const nodes: FlowNode[] = []
    const edges: FlowEdge[] = []

    // Always create Trigger Node
    const triggerId = 'node-trigger'
    nodes.push({
        id: triggerId,
        type: 'trigger',
        x: 80,
        y: 180,
        data: {
            label: 'Inbound WhatsApp Trigger',
            triggerKind: triggerKind as any,
            keyword
        }
    })

    let lastNodeId = triggerId
    let currX = 380
    let currY = 180

    steps.forEach((step, idx) => {
        const nodeId = `node-step-${idx + 1}`
        let type: FlowNodeType = 'text'
        let data: any = { label: `Step ${idx + 1}` }

        if (step.kind === 'text') {
            type = 'text'
            data = {
                label: 'Send WhatsApp Text',
                text: step.text
            }
        } else if (step.kind === 'wait') {
            type = 'wait'
            const parsed = fromSeconds(step.seconds)
            data = {
                label: `Delay (${parsed.duration} ${parsed.unit})`,
                waitDuration: parsed.duration,
                waitUnit: parsed.unit
            }
        } else if (step.kind === 'condition') {
            type = 'condition'
            data = {
                label: `Filter: ${step.field} == "${step.equals}"`,
                conditionField: step.field,
                conditionEquals: step.equals,
                conditionKey: step.key
            }
        } else if (step.kind === 'business_hours') {
            type = 'business_hours'
            data = {
                label: `Hours (${step.start} - ${step.end})`,
                timezone: step.timezone,
                days: step.days,
                startTime: step.start,
                endTime: step.end
            }
        } else if (step.kind === 'handoff') {
            type = 'handoff'
            data = { label: 'Human Agent Handoff' }
        } else {
            type = 'text'
            data = { label: step.kind, text: JSON.stringify(step) }
        }

        nodes.push({
            id: nodeId,
            type,
            x: currX,
            y: currY,
            data
        })

        edges.push({
            id: `edge-${lastNodeId}-${nodeId}`,
            source: lastNodeId,
            target: nodeId
        })

        lastNodeId = nodeId
        currX += 300
        if (currX > 1400) {
            currX = 380
            currY += 220
        }
    })

    return { nodes, edges }
}
