import React, { useState, useEffect } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Table,
    Badge,
    Form,
    FormGroup,
    Label,
    Input,
    Spinner,
    Alert
} from 'reactstrap'
import { Users, Plus, Edit2, Trash2, CheckCircle, Shield } from 'react-feather'
import { whatsappService, AgentPod, CreateAgentPodPayload } from '../../../services/whatsappService'

interface AgentPodsManagementModalProps {
    isOpen: boolean
    toggle: () => void
}

const AgentPodsManagementModal: React.FC<AgentPodsManagementModalProps> = ({ isOpen, toggle }) => {
    const [pods, setPods] = useState<AgentPod[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingPod, setEditingPod] = useState<AgentPod | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    const [name, setName] = useState('')
    const [department, setDepartment] = useState('general')
    const [skillsText, setSkillsText] = useState('')
    const [maxChats, setMaxChats] = useState(25)

    const loadPods = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await whatsappService.getAgentPods()
            setPods(data || [])
        } catch (err: any) {
            setError(err?.message || 'Failed to load agent pods.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            loadPods()
            setIsCreating(false)
            setEditingPod(null)
        }
    }, [isOpen])

    const startCreate = () => {
        setName('')
        setDepartment('general')
        setSkillsText('')
        setMaxChats(25)
        setEditingPod(null)
        setIsCreating(true)
    }

    const startEdit = (pod: AgentPod) => {
        setName(pod.name)
        setDepartment(pod.department || 'general')
        setSkillsText((pod.skills || []).join(', '))
        setMaxChats(pod.max_active_chats || 25)
        setEditingPod(pod)
        setIsCreating(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setSaving(true)
        setError(null)

        const payload: CreateAgentPodPayload = {
            name: name.trim(),
            department: department.trim(),
            skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
            max_active_chats: maxChats,
            active: true
        }

        try {
            if (editingPod) {
                await whatsappService.updateAgentPod(editingPod.id, payload)
            } else {
                await whatsappService.createAgentPod(payload)
            }
            setIsCreating(false)
            setEditingPod(null)
            await loadPods()
        } catch (err: any) {
            setError(err?.message || 'Failed to save agent pod.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this agent pod?')) return
        try {
            await whatsappService.deleteAgentPod(id)
            await loadPods()
        } catch (err: any) {
            setError(err?.message || 'Failed to delete pod.')
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
            <ModalHeader toggle={toggle} className="border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <div className="p-1 rounded bg-light-primary">
                        <Users size={18} className="text-primary" />
                    </div>
                    <div>
                        <h5 className="mb-0 fw-bold">Specialized Agent Pods</h5>
                        <small className="text-muted">Route complex customer intents to dedicated teams</small>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="py-3">
                {error && <Alert color="danger" className="p-2 mb-3">{error}</Alert>}

                {isCreating ? (
                    <Form onSubmit={handleSave} className="p-3 border rounded bg-light mb-3">
                        <h6 className="fw-bold mb-3">
                            {editingPod ? 'Edit Agent Pod' : 'Create New Specialized Pod'}
                        </h6>
                        <div className="row g-2">
                            <FormGroup className="col-md-6 mb-2">
                                <Label className="small fw-semibold">Pod Name *</Label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. VIP Billing & Refunds Pod"
                                    required
                                />
                            </FormGroup>
                            <FormGroup className="col-md-6 mb-2">
                                <Label className="small fw-semibold">Department *</Label>
                                <Input
                                    type="select"
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                >
                                    <option value="general">General Support</option>
                                    <option value="billing">Billing & Payments</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="sales">VIP Sales</option>
                                    <option value="security">Account Security</option>
                                    <option value="retention">Customer Retention</option>
                                </Input>
                            </FormGroup>
                            <FormGroup className="col-md-8 mb-2">
                                <Label className="small fw-semibold">Skills (Comma-separated)</Label>
                                <Input
                                    value={skillsText}
                                    onChange={e => setSkillsText(e.target.value)}
                                    placeholder="refunds, invoice_disputes, chargebacks, upi"
                                />
                            </FormGroup>
                            <FormGroup className="col-md-4 mb-2">
                                <Label className="small fw-semibold">Max Active Chats</Label>
                                <Input
                                    type="number"
                                    value={maxChats}
                                    onChange={e => setMaxChats(Number(e.target.value) || 25)}
                                    min={1}
                                    max={200}
                                />
                            </FormGroup>
                        </div>
                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <Button size="sm" color="secondary" outline onClick={() => setIsCreating(false)} disabled={saving}>
                                Cancel
                            </Button>
                            <Button size="sm" color="primary" type="submit" disabled={saving || !name.trim()}>
                                {saving ? <Spinner size="sm" /> : 'Save Pod'}
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="small text-muted">
                            Active pods auto-receive conversations matching routing intents.
                        </span>
                        <Button color="primary" size="sm" onClick={startCreate} className="d-flex align-items-center gap-1">
                            <Plus size={14} />
                            <span>Add Agent Pod</span>
                        </Button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-4">
                        <Spinner color="primary" />
                    </div>
                ) : pods.length === 0 ? (
                    <div className="text-center py-4 text-muted border rounded">
                        <Shield size={32} className="mb-2 text-muted" />
                        <div>No agent pods configured yet. Create one to organize your support teams.</div>
                    </div>
                ) : (
                    <div className="table-responsive border rounded">
                        <Table hover className="mb-0 text-nowrap" size="sm">
                            <thead className="table-light">
                                <tr>
                                    <th>Pod Name</th>
                                    <th>Department</th>
                                    <th>Skills</th>
                                    <th>Active Chats</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pods.map(pod => (
                                    <tr key={pod.id}>
                                        <td className="fw-bold">{pod.name}</td>
                                        <td>
                                            <Badge color="light-info" pill>
                                                {pod.department}
                                            </Badge>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {(pod.skills || []).slice(0, 3).join(', ') || 'General'}
                                            </small>
                                        </td>
                                        <td>{pod.open_chats_count || 0} / {pod.max_active_chats}</td>
                                        <td className="text-end">
                                            <Button color="link" size="sm" className="p-1 text-primary" onClick={() => startEdit(pod)}>
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button color="link" size="sm" className="p-1 text-danger" onClick={() => handleDelete(pod.id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="border-top">
                <Button color="secondary" onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default AgentPodsManagementModal

