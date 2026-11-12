import { useEffect, useState } from 'react'
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Row,
    Col,
    Button,
    Badge,
    Input,
    Label,
    Table,
    Alert,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup
} from 'reactstrap'
import {
    Clock,
    Plus,
    Calendar,
    Send,
    Users,
    Activity,
    Play,
    Pause,
    RotateCw,
    CheckCircle,
    ArrowRight,
    MessageSquare,
    AlertCircle,
    Zap,
    Trash2
} from 'react-feather'
import httpConfig from '../../utility/http/httpConfig'

interface DripStep {
    id: string
    title: string
    delayValue: number
    delayUnit: 'hours' | 'days'
    message: string
    buttons?: string[]
}

const PRESET_TEMPLATES = [
    {
        id: 'welcome_7d',
        name: '7-Day Customer Onboarding & Welcome Drip',
        triggerKeyword: 'WELCOME',
        description: 'Guide new signups through product features with timed educational messages.',
        steps: [
            {
                id: 's1',
                title: 'Immediate Welcome & Brochure',
                delayValue: 0,
                delayUnit: 'hours' as const,
                message: 'Hello {{name}}! 👋 Welcome to KRAD Chat. We are thrilled to partner with you. Here is your quickstart guide.',
                buttons: ['View Features', 'Book Onboarding']
            },
            {
                id: 's2',
                title: 'Day 1 Check-In (24 Hours)',
                delayValue: 24,
                delayUnit: 'hours' as const,
                message: 'Hi {{name}}, Kishan from KRAD here. Did you get a chance to review the setup guide? Let us know if you need assistance!',
                buttons: ['Everything Good 👍', 'Need Assistance ❓']
            },
            {
                id: 's3',
                title: 'Day 3 Pro-Tips (48 Hours)',
                delayValue: 48,
                delayUnit: 'hours' as const,
                message: '💡 Pro-Tip: You can build interactive chatbot flows and send bulk broadcasts directly through our WhatsApp Cloud API console.',
                buttons: ['Explore Bots', 'View Tutorials']
            },
            {
                id: 's4',
                title: 'Day 7 Account Review (96 Hours)',
                delayValue: 96,
                delayUnit: 'hours' as const,
                message: 'Hey {{name}}, how has your experience been so far? Would you like a 15-minute optimization call with our solutions team?',
                buttons: ['Schedule Call 📅', 'All Set!']
            }
        ]
    },
    {
        id: 'cart_recovery_3d',
        name: '3-Day Abandoned Cart / Inquiry Follow-Up',
        triggerKeyword: 'OFFER',
        description: 'Re-engage customers who asked about pricing or products with special incentives.',
        steps: [
            {
                id: 'c1',
                title: '1-Hour Friendly Reminder',
                delayValue: 1,
                delayUnit: 'hours' as const,
                message: 'Hi {{name}}, we noticed you were exploring our WhatsApp Cloud API plans. Can we answer any questions for you?',
                buttons: ['See Plans', 'Talk to Sales']
            },
            {
                id: 'c2',
                title: '24-Hour Special Discount (10% Off)',
                delayValue: 24,
                delayUnit: 'hours' as const,
                message: 'Exclusive 24-hour offer! Use code *KRAD10* to get 10% off your first month of unlimited WhatsApp team inbox.',
                buttons: ['Claim Offer 🎁', 'Remind Later']
            },
            {
                id: 'c3',
                title: '72-Hour Final Call',
                delayValue: 48,
                delayUnit: 'hours' as const,
                message: 'Last chance, {{name}}! Your special onboarding offer expires tonight. Click below to activate your account.',
                buttons: ['Activate Now 🚀']
            }
        ]
    }
]

export default function DripSequences() {
    const [dripData, setDripData] = useState<any>({
        sequences: [],
        active_runs: [],
        stats: { total_sequences: 0, active_sequences: 0, total_enrolled: 0, in_progress: 0, completed: 0 }
    })
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')

    // Create / Edit Sequence Modal
    const [modalOpen, setModalOpen] = useState(false)
    const [sequenceName, setSequenceName] = useState('7-Day Welcome Drip')
    const [triggerKind, setTriggerKind] = useState<'keyword' | 'new_contact'>('keyword')
    const [triggerKeyword, setTriggerKeyword] = useState('JOIN')
    const [steps, setSteps] = useState<DripStep[]>(PRESET_TEMPLATES[0].steps)

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
        setBusy(true)
        try {
            const data = await api('drip-sequences')
            setDripData(data)
        } catch {
            // Fallback to workflows list if endpoint not yet warmed up
            try {
                const flows = await api('workflows')
                const runs = await api('workflows/runs')
                setDripData({
                    sequences: flows,
                    active_runs: runs,
                    stats: {
                        total_sequences: flows.length,
                        active_sequences: flows.filter((f: any) => f.enabled).length,
                        total_enrolled: runs.length,
                        in_progress: runs.filter((r: any) => r.status === 'queued' || r.status === 'running').length,
                        completed: runs.filter((r: any) => r.status === 'completed').length
                    }
                })
            } catch (err: any) {
                setError(err.message || 'Could not load drip sequences.')
            }
        } finally {
            setBusy(false)
        }
    }

    useEffect(() => {
        void refresh()
    }, [])

    const loadPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
        setSequenceName(preset.name)
        setTriggerKeyword(preset.triggerKeyword)
        setSteps(preset.steps)
    }

    const addStep = () => {
        const newStep: DripStep = {
            id: `step_${Date.now()}`,
            title: `Follow-up Step #${steps.length + 1}`,
            delayValue: 24,
            delayUnit: 'hours',
            message: 'Hello {{name}}, following up regarding your WhatsApp inquiry.',
            buttons: ['Reply', 'Not Interested']
        }
        setSteps([...steps, newStep])
    }

    const removeStep = (idx: number) => {
        setSteps(steps.filter((_, i) => i !== idx))
    }

    const updateStep = (idx: number, fields: Partial<DripStep>) => {
        const updated = [...steps]
        updated[idx] = { ...updated[idx], ...fields }
        setSteps(updated)
    }

    const saveDripSequence = async () => {
        if (!sequenceName.trim()) {
            setError('Please provide a sequence name.')
            return
        }

        setBusy(true)
        setError('')
        setNotice('')

        // Compile steps into workflow definition with wait steps
        const compiledSteps: any[] = []
        steps.forEach((step, idx) => {
            if (idx > 0 && step.delayValue > 0) {
                const seconds = step.delayUnit === 'days' ? step.delayValue * 86400 : step.delayValue * 3600
                compiledSteps.push({
                    kind: 'wait',
                    seconds: Math.min(2592000, seconds)
                })
            }
            compiledSteps.push({
                kind: 'text',
                text: step.message
            })
        })

        try {
            const created = await api('workflows', 'POST', {
                name: `[DRIP] ${sequenceName}`,
                trigger_kind: triggerKind,
                keyword: triggerKind === 'keyword' ? triggerKeyword : '',
                definition: { steps: compiledSteps }
            })
            // Publish and enable
            await api(`workflows/${created.id}/publish`, 'POST', { enabled: true })
            setNotice(`Drip Sequence "${sequenceName}" created and activated successfully!`)
            setModalOpen(false)
            await refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to save drip sequence.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className='drip-sequences-view'>
            {/* TOP HEADER */}
            <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2'>
                <div>
                    <h2 className='fw-bold text-dark mb-25 d-flex align-items-center gap-1'>
                        <Clock className='text-success' size={26} />
                        Automated WhatsApp Drip Sequences
                    </h2>
                    <p className='text-muted small mb-0'>
                        Schedule multi-day automated WhatsApp message follow-ups triggered by keywords, new contact creation, or customer inquiries.
                    </p>
                </div>
                <div className='d-flex align-items-center gap-1'>
                    <Button color='flat-secondary' size='sm' onClick={refresh} disabled={busy}>
                        <RotateCw size={14} className={busy ? 'rotate-anim' : ''} /> Refresh
                    </Button>
                    <Button color='primary' className='d-inline-flex align-items-center gap-50' onClick={() => setModalOpen(true)}>
                        <Plus size={16} /> Create Drip Sequence
                    </Button>
                </div>
            </div>

            {error && <Alert color='danger' toggle={() => setError('')}>{error}</Alert>}
            {notice && <Alert color='success' toggle={() => setNotice('')}>{notice}</Alert>}

            {/* KPI OVERVIEW CARDS */}
            <Row className='g-2 mb-3'>
                <Col md='3' sm='6'>
                    <Card className='border-0 shadow-sm'>
                        <CardBody className='p-2 d-flex align-items-center gap-2'>
                            <div className='p-1 rounded-circle bg-light-primary text-primary'>
                                <Clock size={22} />
                            </div>
                            <div>
                                <h3 className='fw-bold mb-0'>{dripData.stats.total_sequences}</h3>
                                <span className='small text-muted'>Total Sequences</span>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col md='3' sm='6'>
                    <Card className='border-0 shadow-sm'>
                        <CardBody className='p-2 d-flex align-items-center gap-2'>
                            <div className='p-1 rounded-circle bg-light-success text-success'>
                                <Zap size={22} />
                            </div>
                            <div>
                                <h3 className='fw-bold mb-0'>{dripData.stats.active_sequences}</h3>
                                <span className='small text-muted'>Active Campaigns</span>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col md='3' sm='6'>
                    <Card className='border-0 shadow-sm'>
                        <CardBody className='p-2 d-flex align-items-center gap-2'>
                            <div className='p-1 rounded-circle bg-light-warning text-warning'>
                                <Activity size={22} />
                            </div>
                            <div>
                                <h3 className='fw-bold mb-0'>{dripData.stats.in_progress}</h3>
                                <span className='small text-muted'>In-Flight Messages</span>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col md='3' sm='6'>
                    <Card className='border-0 shadow-sm'>
                        <CardBody className='p-2 d-flex align-items-center gap-2'>
                            <div className='p-1 rounded-circle bg-light-info text-info'>
                                <Users size={22} />
                            </div>
                            <div>
                                <h3 className='fw-bold mb-0'>{dripData.stats.total_enrolled}</h3>
                                <span className='small text-muted'>Enrolled Contacts</span>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* PRE-BUILT DRIP RECIPES SHOWCASE */}
            <Card className='border-0 shadow-sm mb-3' style={{ borderRadius: '16px' }}>
                <CardHeader className='border-bottom pb-1'>
                    <CardTitle tag='h5' className='mb-0 fw-bold'>
                        ⭐ Recommended Drip Playbooks
                    </CardTitle>
                </CardHeader>
                <CardBody className='pt-2'>
                    <Row className='g-2'>
                        {PRESET_TEMPLATES.map(preset => (
                            <Col md='6' key={preset.id}>
                                <div className='p-2 border rounded h-100 bg-light-subtle d-flex flex-column justify-content-between'>
                                    <div>
                                        <div className='d-flex justify-content-between align-items-start mb-50'>
                                            <h6 className='fw-bold text-dark mb-0'>{preset.name}</h6>
                                            <Badge color='light-success' pill>Trigger: {preset.triggerKeyword}</Badge>
                                        </div>
                                        <p className='small text-muted mb-2'>{preset.description}</p>
                                        <div className='d-flex flex-wrap gap-1 align-items-center small text-secondary mb-2'>
                                            {preset.steps.map((st, i) => (
                                                <span key={i} className='badge bg-white text-dark border p-50'>
                                                    {i === 0 ? 'Day 0 (Instant)' : `+${st.delayValue}h`}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                        size='sm'
                                        color='primary'
                                        outline
                                        className='align-self-start'
                                        onClick={() => {
                                            loadPreset(preset)
                                            setModalOpen(true)
                                        }}
                                    >
                                        Use This Playbook <ArrowRight size={13} className='ms-25' />
                                    </Button>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </CardBody>
            </Card>

            {/* ACTIVE CONTACT JOURNEYS & RUNS DASHBOARD */}
            <Card className='border-0 shadow-sm' style={{ borderRadius: '16px' }}>
                <CardHeader className='border-bottom pb-1 d-flex justify-content-between align-items-center'>
                    <CardTitle tag='h5' className='mb-0 fw-bold'>
                        Active Drip Status & Enrolled Contact Journeys
                    </CardTitle>
                    <Badge color='light-primary' pill>{dripData.active_runs.length} Active Records</Badge>
                </CardHeader>
                <CardBody className='pt-2'>
                    <Table responsive hover>
                        <thead className='table-light'>
                            <tr>
                                <th>Journey ID</th>
                                <th>Sequence Name</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Next Scheduled Dispatch</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dripData.active_runs.map((run: any) => (
                                <tr key={run.id}>
                                    <td className='fw-bold'>#{run.id}</td>
                                    <td>
                                        <div className='fw-bold text-dark'>{run.name}</div>
                                        <div className='small text-muted'>Version {run.version}</div>
                                    </td>
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
                                    <td>
                                        {run.status === 'queued' ? (
                                            <span className='small text-primary fw-bold'>
                                                <Clock size={12} className='me-25' />
                                                {new Date(run.available_at).toLocaleString()}
                                            </span>
                                        ) : run.status === 'completed' ? (
                                            <span className='small text-success'>Journey Finished</span>
                                        ) : (
                                            <span className='small text-muted'>-</span>
                                        )}
                                    </td>
                                    <td>
                                        {run.status === 'failed' && (
                                            <Button
                                                size='sm'
                                                color='warning'
                                                outline
                                                onClick={async () => {
                                                    await api(`workflows/runs/${run.id}/retry`, 'POST', {})
                                                    await refresh()
                                                }}
                                            >
                                                Retry Step
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!dripData.active_runs.length && (
                                <tr>
                                    <td colSpan={6} className='text-center py-4 text-muted'>
                                        No active drip journeys currently running. Create a sequence above to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            {/* CREATE / EDIT DRIP SEQUENCE MODAL */}
            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size='lg' centered>
                <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
                    <div className='d-flex align-items-center gap-1'>
                        <Clock size={20} className='text-primary' />
                        <span className='fw-bold'>Configure Automated Drip Sequence</span>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <Row className='g-2 mb-2'>
                        <Col md='6'>
                            <FormGroup className='mb-0'>
                                <Label className='fw-bold small text-muted'>Sequence Name *</Label>
                                <Input
                                    value={sequenceName}
                                    onChange={e => setSequenceName(e.target.value)}
                                    placeholder='e.g. 7-Day Lead Nurturing'
                                />
                            </FormGroup>
                        </Col>
                        <Col md='3'>
                            <FormGroup className='mb-0'>
                                <Label className='fw-bold small text-muted'>Enrollment Trigger</Label>
                                <Input
                                    type='select'
                                    value={triggerKind}
                                    onChange={e => setTriggerKind(e.target.value as any)}
                                >
                                    <option value='keyword'>Customer Keyword</option>
                                    <option value='new_contact'>New Contact Created</option>
                                </Input>
                            </FormGroup>
                        </Col>
                        {triggerKind === 'keyword' && (
                            <Col md='3'>
                                <FormGroup className='mb-0'>
                                    <Label className='fw-bold small text-muted'>Trigger Keyword *</Label>
                                    <Input
                                        value={triggerKeyword}
                                        onChange={e => setTriggerKeyword(e.target.value)}
                                        placeholder='e.g. JOIN'
                                    />
                                </FormGroup>
                            </Col>
                        )}
                    </Row>

                    {/* Timeline Sequence Steps */}
                    <div className='mb-2'>
                        <div className='d-flex justify-content-between align-items-center mb-1'>
                            <h6 className='fw-bold mb-0'>Timeline Follow-Up Steps ({steps.length})</h6>
                            <Button size='sm' color='primary' outline onClick={addStep}>
                                <Plus size={14} className='me-25' /> Add Follow-Up Step
                            </Button>
                        </div>

                        {steps.map((st, idx) => (
                            <div key={st.id || idx} className='p-2 border rounded mb-2 bg-light position-relative'>
                                <div className='d-flex justify-content-between align-items-center mb-1'>
                                    <div className='d-flex align-items-center gap-1'>
                                        <Badge color='primary' pill>Step {idx + 1}</Badge>
                                        <Input
                                            bsSize='sm'
                                            style={{ maxWidth: '280px' }}
                                            value={st.title}
                                            onChange={e => updateStep(idx, { title: e.target.value })}
                                            placeholder='Step Label'
                                        />
                                    </div>
                                    {steps.length > 1 && (
                                        <Button
                                            size='sm'
                                            color='flat-danger'
                                            className='btn-icon p-0'
                                            onClick={() => removeStep(idx)}
                                        >
                                            <Trash2 size={15} />
                                        </Button>
                                    )}
                                </div>

                                {idx > 0 && (
                                    <div className='d-flex align-items-center gap-1 mb-1 p-1 bg-white rounded border'>
                                        <Clock size={16} className='text-muted' />
                                        <span className='small fw-bold text-muted'>Delay from previous message:</span>
                                        <Input
                                            bsSize='sm'
                                            type='number'
                                            min={1}
                                            style={{ width: '90px' }}
                                            value={st.delayValue}
                                            onChange={e => updateStep(idx, { delayValue: parseInt(e.target.value) || 1 })}
                                        />
                                        <Input
                                            bsSize='sm'
                                            type='select'
                                            style={{ width: '110px' }}
                                            value={st.delayUnit}
                                            onChange={e => updateStep(idx, { delayUnit: e.target.value as any })}
                                        >
                                            <option value='hours'>Hours</option>
                                            <option value='days'>Days</option>
                                        </Input>
                                    </div>
                                )}

                                <FormGroup className='mb-0'>
                                    <Label className='small fw-bold text-muted'>WhatsApp Message Text</Label>
                                    <Input
                                        type='textarea'
                                        rows={3}
                                        value={st.message}
                                        onChange={e => updateStep(idx, { message: e.target.value })}
                                        placeholder='Enter follow-up message text. Use {{name}} for dynamic personalization.'
                                    />
                                </FormGroup>
                            </div>
                        ))}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color='secondary' outline onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button color='primary' disabled={busy || !sequenceName.trim()} onClick={saveDripSequence}>
                        {busy ? 'Activating...' : 'Publish & Launch Drip Sequence'}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}
