import React, { useEffect, useState } from 'react'
import {
    GitBranch,
    Plus,
    Trash2,
    Play,
    CheckCircle,
    X
} from 'react-feather'
import {
    Modal,
    ModalHeader,
    ModalBody,
    Nav,
    NavItem,
    NavLink,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Card,
    CardBody,
    Badge
} from 'reactstrap'
import {
    whatsappService,
    WhatsAppConnection,
    WabaRoutingRule,
    SimulateRouteResult
} from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface InboundRouterModalProps {
    connections: WhatsAppConnection[]
    isOpen: boolean
    onClose: () => void
}

export function InboundRouterModal({
    connections,
    isOpen,
    onClose
}: InboundRouterModalProps) {
    const [tab, setTab] = useState<'rules' | 'simulate' | 'new'>('rules')
    const [rules, setRules] = useState<WabaRoutingRule[]>([])
    const [loading, setLoading] = useState(false)

    // New rule form state
    const [name, setName] = useState('')
    const [ruleType, setRuleType] = useState<'geo' | 'department' | 'keyword' | 'fallback'>('geo')
    const [pattern, setPattern] = useState('')
    const [targetPhoneId, setTargetPhoneId] = useState('')
    const [department, setDepartment] = useState('support')
    const [priority, setPriority] = useState(10)

    // Simulation state
    const [simPhone, setSimPhone] = useState('+14155552671')
    const [simText, setSimText] = useState('Hello, I need help with an order')
    const [simResult, setSimResult] = useState<SimulateRouteResult | null>(null)
    const [simulating, setSimulating] = useState(false)

    const fetchRules = async () => {
        setLoading(true)
        try {
            const data = await whatsappService.getRoutingRules()
            setRules(data)
        } catch {
            // handle error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchRules()
            if (connections.length > 0 && !targetPhoneId) {
                setTargetPhoneId(connections[0].phone_number_id)
            }
        }
    }, [isOpen, connections])

    if (!isOpen) return null

    const handleCreateRule = async (e: React.FormEvent) => {
        e.preventDefault()
        const targetConn = connections.find(c => c.phone_number_id === targetPhoneId) || connections[0]
        if (!targetConn) {
            ErrorToast('Please select a target phone number line.')
            return
        }

        try {
            await whatsappService.createRoutingRule({
                name,
                rule_type: ruleType,
                match_pattern: pattern || (ruleType === 'fallback' ? '*' : '+1'),
                target_phone_number_id: targetConn.phone_number_id,
                target_waba_id: targetConn.waba_id,
                department,
                priority,
                active: true
            })
            SuccessToast('Routing rule added successfully!')
            setName('')
            setPattern('')
            setTab('rules')
            fetchRules()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to create routing rule'
            ErrorToast(msg)
        }
    }

    const handleDeleteRule = async (id: number) => {
        try {
            await whatsappService.deleteRoutingRule(id)
            SuccessToast('Routing rule removed')
            fetchRules()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to delete rule'
            ErrorToast(msg)
        }
    }

    const handleSimulate = async () => {
        setSimulating(true)
        try {
            const res = await whatsappService.simulateRoute(simPhone, simText)
            setSimResult(res)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Simulation failed'
            ErrorToast(msg)
        } finally {
            setSimulating(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={onClose}
            centered
            size="lg"
            className="modal-dialog-centered"
            contentClassName="rounded-3 shadow-lg border-0"
        >
            <ModalHeader
                toggle={onClose}
                className="border-bottom py-1"
                close={
                    <Button color="link" size="sm" className="p-50 text-muted" onClick={onClose}>
                        <X size={20} />
                    </Button>
                }
            >
                <div className="d-flex align-items-center gap-1">
                    <div
                        className="d-flex align-items-center justify-content-center p-50 rounded"
                        style={{ backgroundColor: '#fff4eb', color: '#ff8c21' }}
                    >
                        <GitBranch size={18} />
                    </div>
                    <div>
                        <span className="fw-bolder" style={{ color: '#5e5873', fontSize: '1.1rem' }}>
                            Multi-WABA Inbound Router
                        </span>
                        <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
                            Distribute incoming conversations by dialing prefix or department
                        </div>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="p-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <Nav tabs className="mb-2">
                    <NavItem>
                        <NavLink
                            active={tab === 'rules'}
                            onClick={() => setTab('rules')}
                            className="cursor-pointer"
                            style={{
                                color: tab === 'rules' ? '#ff8c21' : '#6e6b7b',
                                borderBottom: tab === 'rules' ? '2px solid #ff8c21' : 'none',
                                fontWeight: tab === 'rules' ? 600 : 400
                            }}
                        >
                            Active Rules ({rules.length})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            active={tab === 'new'}
                            onClick={() => setTab('new')}
                            className="cursor-pointer"
                            style={{
                                color: tab === 'new' ? '#ff8c21' : '#6e6b7b',
                                borderBottom: tab === 'new' ? '2px solid #ff8c21' : 'none',
                                fontWeight: tab === 'new' ? 600 : 400
                            }}
                        >
                            Add New Rule
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            active={tab === 'simulate'}
                            onClick={() => setTab('simulate')}
                            className="cursor-pointer"
                            style={{
                                color: tab === 'simulate' ? '#ff8c21' : '#6e6b7b',
                                borderBottom: tab === 'simulate' ? '2px solid #ff8c21' : 'none',
                                fontWeight: tab === 'simulate' ? 600 : 400
                            }}
                        >
                            Simulate & Test
                        </NavLink>
                    </NavItem>
                </Nav>

                {tab === 'rules' && (
                    <div>
                        {loading ? (
                            <div className="text-center py-3 text-muted">Loading routing rules...</div>
                        ) : rules.length === 0 ? (
                            <div className="text-center py-3 text-muted">
                                <p className="mb-1">No routing rules configured yet.</p>
                                <Button
                                    size="sm"
                                    onClick={() => setTab('new')}
                                    style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff' }}
                                >
                                    <Plus size={14} className="me-50" />
                                    <span>Create First Rule</span>
                                </Button>
                            </div>
                        ) : (
                            rules.map((rule) => (
                                <Card key={rule.id} className="mb-1 border shadow-none" style={{ borderRadius: '8px' }}>
                                    <CardBody className="p-1 d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="fw-bolder" style={{ color: '#22292f' }}>
                                                {rule.name}
                                                <Badge color="light-primary" pill className="ms-1 text-uppercase">
                                                    {rule.rule_type}
                                                </Badge>
                                            </div>
                                            <div className="small text-muted mt-25">
                                                Pattern: <code className="text-primary">{rule.match_pattern}</code> •
                                                Target: <span className="font-monospace">{rule.target_phone_number_id}</span> •
                                                Dept: <Badge color="light-info">{rule.department}</Badge> •
                                                Priority: {rule.priority}
                                            </div>
                                        </div>
                                        <Button
                                            color="link"
                                            size="sm"
                                            className="text-danger p-50"
                                            onClick={() => handleDeleteRule(rule.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </CardBody>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {tab === 'new' && (
                    <Form onSubmit={handleCreateRule}>
                        <Row className="g-1">
                            <Col md="6">
                                <FormGroup>
                                    <Label className="small fw-bold">Rule Name</Label>
                                    <Input
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. North America Routing"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <Label className="small fw-bold">Rule Type</Label>
                                    <Input
                                        type="select"
                                        value={ruleType}
                                        onChange={e => setRuleType(e.target.value as any)}
                                    >
                                        <option value="geo">Geographic Dialing Code Prefix</option>
                                        <option value="department">Department Keyword Routing</option>
                                        <option value="keyword">Custom Keyword Match</option>
                                        <option value="fallback">Default Fallback Line</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <Label className="small fw-bold">
                                        {ruleType === 'geo' ? 'Country Dialing Prefix (e.g. +1, +44, +91)' : 'Match Pattern / Keyword'}
                                    </Label>
                                    <Input
                                        required
                                        value={pattern}
                                        onChange={e => setPattern(e.target.value)}
                                        placeholder={ruleType === 'geo' ? '+1' : 'sales, pricing'}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <Label className="small fw-bold">Target WhatsApp Line</Label>
                                    <Input
                                        type="select"
                                        value={targetPhoneId}
                                        onChange={e => setTargetPhoneId(e.target.value)}
                                    >
                                        {connections.map(c => (
                                            <option key={c.id} value={c.phone_number_id}>
                                                {c.display_phone_number || c.phone_number_id} ({c.verified_name || 'Line'})
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <Label className="small fw-bold">Assign Department Queue</Label>
                                    <Input
                                        type="select"
                                        value={department}
                                        onChange={e => setDepartment(e.target.value)}
                                    >
                                        <option value="support">Support</option>
                                        <option value="sales">Sales</option>
                                        <option value="billing">Billing</option>
                                        <option value="general">General</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <Label className="small fw-bold">Priority (Lower runs first)</Label>
                                    <Input
                                        type="number"
                                        value={priority}
                                        onChange={e => setPriority(Number(e.target.value))}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="12" className="d-flex justify-content-end gap-1 mt-1">
                                <Button
                                    type="button"
                                    color="secondary"
                                    outline
                                    onClick={() => setTab('rules')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff', fontWeight: 600 }}
                                >
                                    Save Routing Rule
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                )}

                {tab === 'simulate' && (
                    <div>
                        <Row className="g-1 mb-2">
                            <Col md="6">
                                <FormGroup>
                                    <Label className="small fw-bold">Customer Phone Number</Label>
                                    <Input
                                        value={simPhone}
                                        onChange={e => setSimPhone(e.target.value)}
                                        placeholder="+14155552671"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <Label className="small fw-bold">Inbound Message Body</Label>
                                    <Input
                                        value={simText}
                                        onChange={e => setSimText(e.target.value)}
                                        placeholder="Hello, I need help with an order"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="12">
                                <Button
                                    disabled={simulating}
                                    onClick={handleSimulate}
                                    style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff', fontWeight: 600 }}
                                >
                                    <Play size={14} className="me-50" />
                                    <span>{simulating ? 'Simulating...' : 'Test Routing Resolution'}</span>
                                </Button>
                            </Col>
                        </Row>

                        {simResult && (
                            <Card className="border shadow-none" style={{ backgroundColor: '#f8f9fa' }}>
                                <CardBody className="p-1">
                                    <div className="d-flex align-items-center gap-1 mb-50">
                                        <CheckCircle size={18} className="text-success" />
                                        <span className="fw-bolder">
                                            {simResult.routed ? `Routed by Rule: ${simResult.rule_name}` : 'Direct Route (No rule matched)'}
                                        </span>
                                    </div>
                                    <div className="small text-muted mb-25">
                                        Reason: <strong className="text-primary">{simResult.reason}</strong>
                                    </div>
                                    <div className="small text-muted">
                                        Target Line: <strong className="font-monospace">{simResult.target_phone_number_id}</strong> •
                                        Department Queue: <strong className="text-uppercase">{simResult.department}</strong>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                )}
            </ModalBody>
        </Modal>
    )
}
