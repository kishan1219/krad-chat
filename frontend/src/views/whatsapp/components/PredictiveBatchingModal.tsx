import React, { useState, useEffect } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Badge,
    Table,
    Alert,
    Nav,
    NavItem,
    NavLink,
    Spinner
} from 'reactstrap'
import { Zap, Calendar, AlertTriangle, Shield, GitMerge, CheckCircle } from 'react-feather'
import {
    TierHeadroomResult,
    SiblingPoolHeadroomResult,
    whatsappService
} from '../../../services/whatsappService'

interface PredictiveBatchingModalProps {
    isOpen: boolean
    toggle: () => void
    headroomData: TierHeadroomResult | null
    totalRecipients: number
    onConfirmDispatch: (mode: 'sequential' | 'sibling_pool') => void
    isSubmitting?: boolean
}

const PredictiveBatchingModal: React.FC<PredictiveBatchingModalProps> = ({
    isOpen,
    toggle,
    headroomData,
    totalRecipients,
    onConfirmDispatch,
    isSubmitting = false
}) => {
    const [activeTab, setActiveTab] = useState<'sequential' | 'sibling_pool'>('sequential')
    const [siblingPool, setSiblingPool] = useState<SiblingPoolHeadroomResult | null>(null)
    const [loadingPool, setLoadingPool] = useState(false)

    useEffect(() => {
        if (isOpen && totalRecipients > 0) {
            setLoadingPool(true)
            whatsappService.getSiblingPoolHeadroom(totalRecipients)
                .then(res => {
                    setSiblingPool(res)
                    if (res.pool_enabled && res.line_count > 1) {
                        setActiveTab('sibling_pool')
                    } else {
                        setActiveTab('sequential')
                    }
                })
                .catch(() => {
                    setSiblingPool(null)
                    setActiveTab('sequential')
                })
                .finally(() => setLoadingPool(false))
        }
    }, [isOpen, totalRecipients])

    if (!headroomData) return null

    const { tier, tier_limit, dispatched_today, safe_headroom, recommended_batches } = headroomData
    const hasSiblingPool = siblingPool && siblingPool.pool_enabled && siblingPool.line_count > 1

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
            <ModalHeader toggle={toggle} className="border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <div className="p-1 rounded bg-light-warning">
                        <Zap size={18} className="text-warning" />
                    </div>
                    <div>
                        <h5 className="mb-0 fw-bold">Predictive Messaging Tier Batching</h5>
                        <small className="text-muted">Protects WhatsApp Number Quality & Daily Caps</small>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="py-3">
                <Alert color="warning" className="d-flex align-items-center mb-3">
                    <AlertTriangle size={20} className="me-2 flex-shrink-0" />
                    <div>
                        <strong>Tier Exhaustion Guard Active:</strong> Your campaign has{' '}
                        <strong>{totalRecipients.toLocaleString()}</strong> recipients, exceeding today's single-line
                        safe headroom (<strong>{safe_headroom.toLocaleString()}</strong> remaining).
                    </div>
                </Alert>

                {hasSiblingPool && (
                    <Nav tabs className="mb-3">
                        <NavItem>
                            <NavLink
                                className={`cursor-pointer ${activeTab === 'sibling_pool' ? 'active fw-bold' : ''}`}
                                onClick={() => setActiveTab('sibling_pool')}
                            >
                                <GitMerge size={14} className="me-1 text-primary" />
                                Multi-WABA Sibling Balancing
                                <Badge color="success" pill className="ms-1" style={{ fontSize: '0.65rem' }}>
                                    Send All Today
                                </Badge>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={`cursor-pointer ${activeTab === 'sequential' ? 'active fw-bold' : ''}`}
                                onClick={() => setActiveTab('sequential')}
                            >
                                <Calendar size={14} className="me-1 text-warning" />
                                Sequential 24h Tranches
                            </NavLink>
                        </NavItem>
                    </Nav>
                )}

                {activeTab === 'sibling_pool' && hasSiblingPool ? (
                    <div>
                        <div className="p-2 mb-3 bg-light-primary rounded border border-primary-subtle d-flex justify-content-between align-items-center">
                            <div>
                                <span className="small text-muted d-block">Total Pooled Safe Headroom</span>
                                <strong className="text-primary fs-6">
                                    {siblingPool.total_pooled_headroom.toLocaleString()} contacts across {siblingPool.line_count} sibling lines
                                </strong>
                            </div>
                            <Badge color="light-success" className="d-flex align-items-center gap-1">
                                <CheckCircle size={12} />
                                <span>Zero Delay Dispatch</span>
                            </Badge>
                        </div>

                        <div className="table-responsive border rounded mb-3">
                            <Table hover className="mb-0 text-nowrap" size="sm">
                                <thead className="table-light">
                                    <tr>
                                        <th>Sibling Number</th>
                                        <th>Tier</th>
                                        <th>Safe Headroom</th>
                                        <th>Allocation</th>
                                        <th>Share</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {siblingPool.allocated_batches.map((batch, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-semibold">
                                                {batch.displayPhoneNumber || batch.phoneNumberId}
                                            </td>
                                            <td>
                                                <Badge color="light-secondary" pill>
                                                    {siblingPool.lines.find(l => l.phone_number_id === batch.phoneNumberId)?.tier || 'TIER_10K'}
                                                </Badge>
                                            </td>
                                            <td className="text-success font-monospace">
                                                {siblingPool.lines.find(l => l.phone_number_id === batch.phoneNumberId)?.safe_headroom.toLocaleString() || '0'}
                                            </td>
                                            <td className="fw-bold">
                                                {batch.count.toLocaleString()} contacts
                                            </td>
                                            <td>
                                                <Badge color="light-primary" pill>
                                                    {batch.percentage}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="row g-2 mb-3">
                            <div className="col-4">
                                <div className="p-2 border rounded text-center bg-light">
                                    <small className="text-muted d-block">Messaging Tier</small>
                                    <Badge color="light-primary" className="fw-bolder fs-6">{tier}</Badge>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="p-2 border rounded text-center bg-light">
                                    <small className="text-muted d-block">Used Today (24h UTC)</small>
                                    <span className="fw-bold fs-6">{dispatched_today.toLocaleString()} / {tier_limit.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="p-2 border rounded text-center bg-light">
                                    <small className="text-muted d-block">Headroom (90% Safe)</small>
                                    <span className="fw-bold fs-6 text-success">{safe_headroom.toLocaleString()} Left</span>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive border rounded mb-3">
                            <Table hover className="mb-0 text-nowrap" size="sm">
                                <thead className="table-light">
                                    <tr>
                                        <th>Tranche</th>
                                        <th>Recipients</th>
                                        <th>Scheduled Dispatch (UTC)</th>
                                        <th>Timing Window</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recommended_batches.map(batch => (
                                        <tr key={batch.batchIndex}>
                                            <td className="fw-bold">
                                                Batch {batch.batchIndex}
                                                {batch.batchIndex === 1 && (
                                                    <Badge color="light-success" className="ms-1" pill>Immediate</Badge>
                                                )}
                                            </td>
                                            <td>{batch.count.toLocaleString()} contacts</td>
                                            <td>{new Date(batch.scheduledAt).toLocaleString()}</td>
                                            <td>{batch.delayHours === 0 ? 'Today (Immediate)' : `+${batch.delayHours}h rolling reset`}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                )}

                <div className="d-flex align-items-center gap-2 p-2 rounded bg-light-info text-dark" style={{ fontSize: '0.82rem' }}>
                    <Shield size={16} className="text-info flex-shrink-0" />
                    <div>
                        {activeTab === 'sibling_pool'
                            ? 'Distributing across sibling numbers utilizes all available quotas simultaneously without waiting 24h.'
                            : 'Splitting ensures 100% deliverability without triggering Meta error 131056 or downgrading phone ratings.'}
                    </div>
                </div>
            </ModalBody>

            <ModalFooter className="border-top">
                <Button color="secondary" outline onClick={toggle} disabled={isSubmitting}>
                    Adjust Recipients
                </Button>
                <Button
                    color="primary"
                    onClick={() => onConfirmDispatch(activeTab)}
                    disabled={isSubmitting || loadingPool}
                >
                    {isSubmitting ? (
                        <>
                            <Spinner size="sm" className="me-1" />
                            {activeTab === 'sibling_pool' ? 'Balancing Sibling Lines...' : 'Scheduling Tranches...'}
                        </>
                    ) : activeTab === 'sibling_pool' ? (
                        'Launch Sibling-Balanced Campaign'
                    ) : (
                        'Acknowledge & Launch Split Campaign'
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default PredictiveBatchingModal
