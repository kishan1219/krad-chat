import { useEffect, useState } from 'react'
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Table,
    Nav,
    NavItem,
    NavLink,
    Badge,
    Spinner
} from 'reactstrap'
import {
    GitBranch,
    List,
    Clock,
    Play,
    Plus,
    RotateCw,
    CheckCircle,
    Sliders,
    Layers,
    Activity,
    UploadCloud,
    Copy,
    Edit3
} from 'react-feather'
import httpConfig from '../../utility/http/httpConfig'
import VisualFlowCanvas from './flow-builder/VisualFlowCanvas'
import { FlowNode, FlowEdge } from './flow-builder/flowTypes'
import { compileFlowToSteps, parseStepsToFlow } from './flow-builder/flowCompiler'

type Step = { kind: string; [key: string]: any }
const defaults: Record<string, Step> = {
    text: { kind: 'text', text: '' },
    template: { kind: 'template', template: { name: '', language: { code: 'en_US' } } },
    contact_update: { kind: 'contact_update', field: 'city', value: '' },
    business_hours: { kind: 'business_hours', timezone: 'Asia/Kolkata', days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00' },
    condition: { kind: 'condition', field: 'message', equals: '' },
    label: { kind: 'label', label: '' },
    assign: { kind: 'assign', user_id: 1 },
    note: { kind: 'note', text: '' },
    notify: { kind: 'notify', title: '', text: '' },
    wait: { kind: 'wait', seconds: 3600 },
    handoff: { kind: 'handoff' }
}

export default function WorkflowBuilder() {
    // Active View Mode
    const [activeTab, setActiveTab] = useState<'canvas' | 'steps' | 'history'>('canvas')

    // Workflow Metadata
    const [editing, setEditing] = useState<number | null>(null)
    const [name, setName] = useState('New WhatsApp Chatbot Flow')
    const [trigger, setTrigger] = useState('keyword')
    const [keyword, setKeyword] = useState('help')

    // Visual Flow State
    const [nodes, setNodes] = useState<FlowNode[]>([])
    const [edges, setEdges] = useState<FlowEdge[]>([])

    // Steps State
    const [steps, setSteps] = useState<Step[]>([{ ...defaults.text }])
    const [kind, setKind] = useState('text')

    // Workflows and Runs
    const [flows, setFlows] = useState<any[]>([])
    const [runs, setRuns] = useState<any[]>([])
    const [detail, setDetail] = useState<any>(null)
    const [preview, setPreview] = useState<any[]>([])
    const [sample, setSample] = useState('help')

    // Feedback
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [busy, setBusy] = useState(false)

    async function api(path: string, method = 'GET', body?: any) {
        const token = JSON.parse(localStorage.getItem('access_token') || 'null')
        const response = await fetch(`${httpConfig.baseUrl}${path}`, {
            method,
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            ...(body ? { body: JSON.stringify(body) } : {})
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Request failed')
        return result.data
    }

    async function refresh() {
        const [f, r] = await Promise.all([api('workflows'), api('workflows/runs')])
        setFlows(f)
        setRuns(r)
    }

    async function action(work: () => Promise<void>) {
        setBusy(true)
        setError('')
        setNotice('')
        try {
            await work()
        } catch (e: any) {
            setError(e.message)
        } finally {
            setBusy(false)
        }
    }

    // Initialize Default Flow
    useEffect(() => {
        void action(async () => {
            await refresh()
            resetToDefaultFlow()
        })
    }, [])

    const resetToDefaultFlow = () => {
        const initialSteps = [
            { kind: 'text', text: 'Hello! Welcome to KRAD Chat. How can we help you today?' },
            { kind: 'wait', seconds: 3600 }
        ]
        setSteps(initialSteps)
        const parsed = parseStepsToFlow(initialSteps, trigger, keyword)
        setNodes(parsed.nodes)
        setEdges(parsed.edges)
        setEditing(null)
        setName('Customer Support Bot Flow')
    }

    // Sync from Visual Canvas to Steps
    const handleNodesChange = (newNodes: FlowNode[]) => {
        setNodes(newNodes)
        const compiled = compileFlowToSteps(newNodes, edges)
        setSteps(compiled)
    }

    const handleEdgesChange = (newEdges: FlowEdge[]) => {
        setEdges(newEdges)
        const compiled = compileFlowToSteps(nodes, newEdges)
        setSteps(compiled)
    }

    // Switch Tabs with bidirectional synchronization
    const handleTabChange = (tab: 'canvas' | 'steps' | 'history') => {
        if (tab === 'steps') {
            // Ensure steps are up to date from canvas
            const compiled = compileFlowToSteps(nodes, edges)
            setSteps(compiled)
        } else if (tab === 'canvas' && activeTab === 'steps') {
            // Ensure canvas is up to date from steps
            const parsed = parseStepsToFlow(steps, trigger, keyword)
            setNodes(parsed.nodes)
            setEdges(parsed.edges)
        }
        setActiveTab(tab)
    }

    // Save Draft
    const handleSaveDraft = async () => {
        await action(async () => {
            const compiledSteps = compileFlowToSteps(nodes, edges)
            const result = await api(editing ? `workflows/${editing}` : 'workflows', editing ? 'PATCH' : 'POST', {
                name,
                trigger_kind: trigger,
                keyword,
                definition: { steps: compiledSteps }
            })
            if (!editing) setEditing(result.id)
            await refresh()
            setNotice(`Flow draft "${name}" saved successfully. Click "Publish & Activate" to put it live.`)
        })
    }

    // Publish Flow
    const handlePublish = async () => {
        await action(async () => {
            const compiledSteps = compileFlowToSteps(nodes, edges)
            let flowId = editing
            if (!flowId) {
                const created = await api('workflows', 'POST', {
                    name,
                    trigger_kind: trigger,
                    keyword,
                    definition: { steps: compiledSteps }
                })
                flowId = created.id
                setEditing(flowId)
            } else {
                await api(`workflows/${flowId}`, 'PATCH', {
                    name,
                    trigger_kind: trigger,
                    keyword,
                    definition: { steps: compiledSteps }
                })
            }
            await api(`workflows/${flowId}/publish`, 'POST', { enabled: true })
            await refresh()
            setNotice(`Flow "${name}" is now published and ACTIVE on WhatsApp!`)
        })
    }

    // Load an existing workflow into builder
    const loadWorkflow = (flow: any) => {
        setEditing(flow.id)
        setName(flow.name)
        setTrigger(flow.trigger_kind)
        setKeyword(flow.keyword || '')
        const loadedSteps = flow.draft?.steps || [{ kind: 'text', text: 'Hello' }]
        setSteps(loadedSteps)
        const parsed = parseStepsToFlow(loadedSteps, flow.trigger_kind, flow.keyword)
        setNodes(parsed.nodes)
        setEdges(parsed.edges)
        setActiveTab('canvas')
        setNotice(`Loaded flow "${flow.name}" into canvas.`)
    }

    const changeStep = (index: number, values: any) =>
        setSteps(steps.map((step, i) => (i === index ? { ...step, ...values } : step)))

    const moveStep = (index: number, direction: number) => {
        const next = steps.slice()
        ;[next[index], next[index + direction]] = [next[index + direction], next[index]]
        setSteps(next)
    }

    return (
        <div className='workflow-builder-view'>
            <Card className='border-0 shadow-sm mb-2' style={{ borderRadius: '16px' }}>
                <CardHeader className='pb-1 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2'>
                    <div>
                        <div className='d-flex align-items-center gap-1 mb-25'>
                            <GitBranch size={22} className='text-primary' />
                            <h3 className='mb-0 fw-bold'>Chatbot Flows & Visual Builder</h3>
                            {editing && <Badge color='light-primary' pill>Editing #{editing}</Badge>}
                        </div>
                        <p className='text-muted small mb-0'>
                            Design multi-step interactive WhatsApp chatbot menus with drag-and-drop nodes, quick reply buttons, list menus, and human handoff.
                        </p>
                    </div>

                    {/* View Switcher Tabs */}
                    <Nav pills className='mb-0'>
                        <NavItem>
                            <NavLink
                                className={`d-flex align-items-center gap-50 py-50 px-1 ${activeTab === 'canvas' ? 'active' : ''}`}
                                onClick={() => handleTabChange('canvas')}
                                style={{ cursor: 'pointer', borderRadius: '8px' }}
                            >
                                <GitBranch size={15} />
                                <span>Visual Canvas</span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={`d-flex align-items-center gap-50 py-50 px-1 ${activeTab === 'steps' ? 'active' : ''}`}
                                onClick={() => handleTabChange('steps')}
                                style={{ cursor: 'pointer', borderRadius: '8px' }}
                            >
                                <List size={15} />
                                <span>Step View ({steps.length})</span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={`d-flex align-items-center gap-50 py-50 px-1 ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => handleTabChange('history')}
                                style={{ cursor: 'pointer', borderRadius: '8px' }}
                            >
                                <Activity size={15} />
                                <span>Saved Flows ({flows.length})</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                </CardHeader>

                <CardBody className='pt-2'>
                    {error && (
                        <Alert color='danger' className='p-1 mb-2' toggle={() => setError('')}>
                            {error}
                        </Alert>
                    )}
                    {notice && (
                        <Alert color='success' className='p-1 mb-2' toggle={() => setNotice('')}>
                            {notice}
                        </Alert>
                    )}

                    {/* Flow Top Header Info */}
                    <div className='row g-2 mb-2 align-items-end'>
                        <div className='col-md-5'>
                            <Label for='workflow-name' className='fw-bold small text-muted'>
                                Flow Name *
                            </Label>
                            <Input
                                id='workflow-name'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder='e.g. Sales Inquiry Bot'
                            />
                        </div>
                        <div className='col-md-3'>
                            <Label for='workflow-trigger' className='fw-bold small text-muted'>
                                Inbound Trigger
                            </Label>
                            <Input
                                id='workflow-trigger'
                                type='select'
                                value={trigger}
                                onChange={e => setTrigger(e.target.value)}
                            >
                                <option value='keyword'>Exact Keyword Match</option>
                                <option value='new_contact'>First Message (New Contact)</option>
                                <option value='incoming'>Any Inbound WhatsApp Message</option>
                            </Input>
                        </div>
                        {trigger === 'keyword' && (
                            <div className='col-md-4'>
                                <Label for='workflow-keyword' className='fw-bold small text-muted'>
                                    Trigger Keyword *
                                </Label>
                                <Input
                                    id='workflow-keyword'
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                    placeholder='e.g. HELP, JOIN, START'
                                />
                            </div>
                        )}
                    </div>

                    {/* 1. VISUAL CANVAS TAB */}
                    {activeTab === 'canvas' && (
                        <VisualFlowCanvas
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={handleNodesChange}
                            onEdgesChange={handleEdgesChange}
                            onSaveDraft={handleSaveDraft}
                            onPublish={handlePublish}
                            isSaving={busy}
                        />
                    )}

                    {/* 2. STEP VIEW TAB */}
                    {activeTab === 'steps' && (
                        <div>
                            <div className='d-flex justify-content-between align-items-center mb-1'>
                                <h5 className='mb-0 fw-bold'>Ordered Execution Steps ({steps.length}/30)</h5>
                                <div className='d-flex gap-1'>
                                    <Button
                                        size='sm'
                                        color='primary'
                                        outline
                                        onClick={() => handleTabChange('canvas')}
                                    >
                                        Back to Visual Canvas
                                    </Button>
                                    <Button
                                        size='sm'
                                        color='primary'
                                        disabled={busy || !name.trim()}
                                        onClick={handleSaveDraft}
                                    >
                                        Save Draft
                                    </Button>
                                </div>
                            </div>

                            {steps.map((step, index) => (
                                <div key={index} className='border rounded p-2 mb-1 bg-light'>
                                    <div className='d-flex justify-content-between align-items-center mb-1'>
                                        <h6 className='mb-0 fw-bold text-primary'>
                                            Step {index + 1}: {step.kind.toUpperCase()}
                                        </h6>
                                        <div className='d-flex gap-50'>
                                            <Button
                                                size='sm'
                                                color='flat-secondary'
                                                disabled={index === 0}
                                                onClick={() => moveStep(index, -1)}
                                            >
                                                Move Up
                                            </Button>
                                            <Button
                                                size='sm'
                                                color='flat-secondary'
                                                disabled={index === steps.length - 1}
                                                onClick={() => moveStep(index, 1)}
                                            >
                                                Move Down
                                            </Button>
                                            <Button
                                                size='sm'
                                                color='flat-danger'
                                                disabled={steps.length === 1}
                                                onClick={() => setSteps(steps.filter((_, i) => i !== index))}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>

                                    {['text', 'note'].includes(step.kind) && (
                                        <Input
                                            type='textarea'
                                            rows={3}
                                            value={step.text || ''}
                                            onChange={e => changeStep(index, { text: e.target.value })}
                                            placeholder='Message text'
                                        />
                                    )}

                                    {step.kind === 'wait' && (
                                        <div className='d-flex align-items-center gap-1'>
                                            <Label className='mb-0'>Wait Duration (Seconds):</Label>
                                            <Input
                                                type='number'
                                                min={1}
                                                max={2592000}
                                                style={{ width: '150px' }}
                                                value={step.seconds}
                                                onChange={e => changeStep(index, { seconds: Number(e.target.value) })}
                                            />
                                            <small className='text-muted'>
                                                ({(step.seconds / 3600).toFixed(1)} hours)
                                            </small>
                                        </div>
                                    )}

                                    {step.kind === 'condition' && (
                                        <div className='row g-1'>
                                            <div className='col-md-4'>
                                                <Input
                                                    type='select'
                                                    value={step.field}
                                                    onChange={e => changeStep(index, { field: e.target.value })}
                                                >
                                                    <option value='message'>Message equals</option>
                                                    <option value='label'>Has label</option>
                                                    <option value='state'>Conversation state</option>
                                                    <option value='custom_field'>Custom field</option>
                                                </Input>
                                            </div>
                                            <div className='col-md-8'>
                                                <Input
                                                    value={step.equals || ''}
                                                    onChange={e => changeStep(index, { equals: e.target.value })}
                                                    placeholder='Expected value'
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {step.kind === 'handoff' && (
                                        <div className='text-warning small'>
                                            Pauses bot and transfers conversation to live agent.
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className='d-flex gap-1 mt-2'>
                                <Input
                                    type='select'
                                    style={{ width: '200px' }}
                                    value={kind}
                                    onChange={e => setKind(e.target.value)}
                                >
                                    {Object.keys(defaults).map(k => (
                                        <option key={k} value={k}>
                                            {k}
                                        </option>
                                    ))}
                                </Input>
                                <Button
                                    color='primary'
                                    outline
                                    disabled={steps.length >= 30}
                                    onClick={() => setSteps([...steps, { ...defaults[kind] }])}
                                >
                                    + Add Step
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* 3. SAVED FLOWS & RUN HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div>
                            <div className='d-flex justify-content-between align-items-center mb-2'>
                                <h5 className='mb-0 fw-bold'>All Configured Workflows</h5>
                                <div className='d-flex gap-1'>
                                    <Button size='sm' color='outline-primary' onClick={resetToDefaultFlow}>
                                        <Plus size={14} /> New Workflow
                                    </Button>
                                    <Button size='sm' color='flat-secondary' onClick={() => void action(refresh)}>
                                        <RotateCw size={14} /> Refresh
                                    </Button>
                                </div>
                            </div>

                            <Table responsive hover className='mb-3'>
                                <thead className='table-light'>
                                    <tr>
                                        <th>Workflow Name</th>
                                        <th>Trigger</th>
                                        <th>Status / Version</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flows.map(flow => (
                                        <tr key={flow.id}>
                                            <td className='fw-bold text-dark'>{flow.name}</td>
                                            <td>
                                                <Badge color='light-secondary' pill>
                                                    {flow.trigger_kind} {flow.keyword ? `"${flow.keyword}"` : ''}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge color={flow.enabled ? 'light-success' : 'light-secondary'} pill>
                                                    {flow.enabled ? 'Active' : 'Disabled'} (v{flow.version})
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    size='sm'
                                                    color='primary'
                                                    outline
                                                    className='me-1'
                                                    onClick={() => loadWorkflow(flow)}
                                                >
                                                    <Edit3 size={13} className='me-25' /> Edit in Canvas
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    color={flow.enabled ? 'warning' : 'success'}
                                                    outline
                                                    onClick={() =>
                                                        void action(async () => {
                                                            await api(`workflows/${flow.id}/publish`, 'POST', {
                                                                enabled: !flow.enabled
                                                            })
                                                            await refresh()
                                                        })
                                                    }
                                                >
                                                    {flow.enabled ? 'Deactivate' : 'Activate'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!flows.length && (
                                        <tr>
                                            <td colSpan={4} className='text-center py-3 text-muted'>
                                                No saved workflows yet. Create your first chatbot flow above!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            <h5 className='fw-bold mb-1'>Recent Execution Runs ({runs.length})</h5>
                            <Table responsive hover size='sm'>
                                <thead className='table-light'>
                                    <tr>
                                        <th>Run ID</th>
                                        <th>Workflow</th>
                                        <th>Status</th>
                                        <th>Current Step</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {runs.map(run => (
                                        <tr key={run.id}>
                                            <td>#{run.id}</td>
                                            <td className='fw-bold'>{run.name} v{run.version}</td>
                                            <td>
                                                <Badge
                                                    color={
                                                        run.status === 'completed'
                                                            ? 'light-success'
                                                            : run.status === 'failed'
                                                            ? 'light-danger'
                                                            : 'light-warning'
                                                    }
                                                    pill
                                                >
                                                    {run.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td>Step {run.step}</td>
                                            <td className='small text-muted'>
                                                {run.error ||
                                                    (run.status === 'queued'
                                                        ? `Eligible: ${new Date(run.available_at).toLocaleString()}`
                                                        : 'In progress')}
                                            </td>
                                        </tr>
                                    ))}
                                    {!runs.length && (
                                        <tr>
                                            <td colSpan={5} className='text-center py-3 text-muted'>
                                                No execution runs logged yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}
