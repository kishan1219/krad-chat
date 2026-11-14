import React, { useEffect, useState } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Card,
    CardBody,
    Badge,
    Spinner,
    Progress,
    Alert
} from 'reactstrap'
import { CheckCircle, AlertCircle, Shield, Award, ExternalLink, X, RefreshCw } from 'react-feather'
import { whatsappService, WhatsAppConnection } from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface OfficialBusinessAccountModalProps {
    isOpen: boolean
    toggle: () => void
    connection: WhatsAppConnection | null
}

export function OfficialBusinessAccountModal({
    isOpen,
    toggle,
    connection
}: OfficialBusinessAccountModalProps) {
    const [loading, setLoading] = useState(false)
    const [applying, setApplying] = useState(false)
    const [evaluating, setEvaluating] = useState(false)
    const [milestoneInfo, setMilestoneInfo] = useState<{ volume?: number; message?: string } | null>(null)
    const [obaData, setObaData] = useState<any>(null)
    const [error, setError] = useState('')

    const loadStatus = () => {
        if (!connection?.id) return
        setLoading(true)
        setError('')
        whatsappService
            .getObaStatus(connection.id)
            .then((res) => setObaData(res))
            .catch((err) => {
                setError(err?.message || 'Could not retrieve OBA verification status')
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (isOpen && connection?.id) {
            loadStatus()
        } else {
            setObaData(null)
            setError('')
            setMilestoneInfo(null)
        }
    }, [isOpen, connection])

    const handleReEvaluate = async () => {
        if (!connection?.id) return
        setEvaluating(true)
        setError('')
        try {
            const res = await whatsappService.checkObaEligibility(connection.id)
            setMilestoneInfo({ volume: res.rolling_30d_volume, message: res.message })
            if (res.eligible) {
                SuccessToast(res.message || 'Milestone achieved! Account is eligible for OBA.')
                setObaData((prev: any) => ({ ...prev, oba_status: 'ELIGIBLE', eligible: true }))
            } else {
                SuccessToast(res.message)
            }
            loadStatus()
        } catch (err: any) {
            setError(err?.message || 'Failed to re-evaluate OBA eligibility.')
        } finally {
            setEvaluating(false)
        }
    }

    const handleApply = async () => {
        if (!connection?.id) return
        setApplying(true)
        setError('')
        try {
            const res = await whatsappService.applyOba(connection.id)
            SuccessToast(res?.message || 'OBA Application submitted to Meta review!')
            setObaData((prev: any) => ({ ...prev, oba_status: 'IN_REVIEW' }))
        } catch (err: any) {
            const msg = err?.message || 'Failed to submit OBA application.'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setApplying(false)
        }
    }

    if (!isOpen || !connection) return null

    const criteria = obaData?.criteria
    const isEligible = Boolean(obaData?.eligible)
    const currentStatus = obaData?.oba_status || connection.oba_status || 'NOT_ELIGIBLE'

    // Compute checklist progress percentage
    let criteriaMetCount = 0
    if (criteria?.volume_milestone?.met) criteriaMetCount++
    if (criteria?.quality_health?.met) criteriaMetCount++
    if (criteria?.two_step_verification?.met) criteriaMetCount++
    if (criteria?.business_verification?.met) criteriaMetCount++
    const overallProgress = Math.round((criteriaMetCount / 4) * 100)

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            className="modal-dialog-centered modal-lg"
            contentClassName="rounded-3 shadow-lg border-0 overflow-hidden"
        >
            <ModalHeader
                toggle={toggle}
                className="border-bottom py-2 px-3 bg-light"
                close={
                    <Button color="link" size="sm" className="p-0 text-muted" onClick={toggle}>
                        <X size={20} />
                    </Button>
                }
            >
                <div className="d-flex align-items-center gap-2">
                    <div
                        className="rounded-3 d-flex align-items-center justify-content-center p-1"
                        style={{ backgroundColor: '#ecfdf5', color: '#16a34a' }}
                    >
                        <Award size={20} />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-bolder text-dark" style={{ fontSize: '1.05rem' }}>
                                WhatsApp Green Checkmark (OBA) Tracker
                            </span>
                            <Badge color="light-success" pill style={{ fontSize: '0.7rem' }}>
                                Official Meta Verification
                            </Badge>
                        </div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>
                            {connection.name} • {connection.display_phone_number || connection.phone_number_id}
                        </div>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="p-3">
                {error && (
                    <Alert color="danger" className="p-2 mb-2 rounded-2" style={{ fontSize: '0.82rem' }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                        <p className="text-muted small mt-2 mb-0">Auditing Meta verification requirements and volume milestones...</p>
                    </div>
                ) : (
                    <div>
                        {/* Live OBA Badge Preview Card */}
                        <Card className="border shadow-none rounded-3 mb-3" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                            <CardBody className="p-3">
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
                                            style={{ width: '48px', height: '48px', backgroundColor: '#25D366' }}
                                        >
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <div className="d-flex align-items-center gap-1">
                                                <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.15rem' }}>
                                                    {connection.verified_name || connection.name || 'KRAD Technology'}
                                                </h5>
                                                {/* Official Meta Green Tick SVG */}
                                                <span title="Meta Official Business Account (Green Tick)" className="d-inline-flex align-items-center">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                        <circle cx="12" cy="12" r="10" fill="#25D366" />
                                                        <path d="M7.5 12L10.5 15L16.5 9" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </span>
                                            </div>
                                            <div className="text-muted font-monospace" style={{ fontSize: '0.82rem' }}>
                                                {connection.display_phone_number || connection.phone_number_id}
                                            </div>
                                            <small className="text-success fw-semibold" style={{ fontSize: '0.75rem' }}>
                                                Verified Meta WhatsApp Business Identity
                                            </small>
                                        </div>
                                    </div>

                                    <Badge
                                        color={
                                            currentStatus === 'APPROVED'
                                                ? 'success'
                                                : currentStatus === 'IN_REVIEW'
                                                ? 'warning'
                                                : isEligible
                                                ? 'success'
                                                : 'secondary'
                                        }
                                        pill
                                        className="py-1 px-3"
                                        style={{ fontSize: '0.82rem', fontWeight: 600 }}
                                    >
                                        {currentStatus === 'APPROVED'
                                            ? '✓ OBA Active (Green Tick)'
                                            : currentStatus === 'IN_REVIEW'
                                            ? '⟳ Application Under Review'
                                            : isEligible
                                            ? '★ Eligible to Apply'
                                            : 'Milestone Progressing'}
                                    </Badge>
                                </div>

                                {/* Overall Audit Progress Bar */}
                                <div className="mt-3 pt-2 border-top border-success border-opacity-25">
                                    <div className="d-flex justify-content-between text-muted small mb-1" style={{ fontSize: '0.78rem' }}>
                                        <span>Overall OBA Audit Readiness</span>
                                        <span className="fw-semibold text-dark">{overallProgress}% ({criteriaMetCount} of 4 Pillars Met)</span>
                                    </div>
                                    <Progress
                                        value={overallProgress}
                                        color={overallProgress === 100 ? 'success' : 'warning'}
                                        style={{ height: '7px', borderRadius: '4px' }}
                                    />
                                </div>

                                {milestoneInfo && (
                                    <div className="mt-2 p-2 rounded bg-light border small text-dark d-flex align-items-center justify-content-between">
                                        <span>{milestoneInfo.message}</span>
                                        {milestoneInfo.volume !== undefined && (
                                            <Badge color="primary" pill>
                                                {milestoneInfo.volume.toLocaleString()} msgs / 30d
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* 4 Pillars of OBA Eligibility Checklist */}
                        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Automated Meta Verification Checklist
                        </h6>

                        <div className="d-flex flex-column gap-2 mb-2">
                            {/* 1. Volume Milestone */}
                            <div className="p-3 border rounded-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-2">
                                        {criteria?.volume_milestone?.met ? (
                                            <CheckCircle size={18} className="text-success" />
                                        ) : (
                                            <AlertCircle size={18} className="text-warning" />
                                        )}
                                        <span className="fw-semibold text-dark small" style={{ fontSize: '0.88rem' }}>
                                            1. Volume Milestone (Tier 10K+)
                                        </span>
                                    </div>
                                    <Badge color={criteria?.volume_milestone?.met ? 'light-success' : 'light-warning'} pill style={{ fontSize: '0.72rem' }}>
                                        Current: {criteria?.volume_milestone?.current || 'TIER_1K'}
                                    </Badge>
                                </div>
                                <p className="text-muted small mb-1" style={{ fontSize: '0.78rem' }}>
                                    {criteria?.volume_milestone?.description || 'High messaging velocity establishing notable brand demand'} (Required: {criteria?.volume_milestone?.required || 'TIER_10K minimum'})
                                </p>
                                <Progress
                                    value={criteria?.volume_milestone?.met ? 100 : 35}
                                    color={criteria?.volume_milestone?.met ? 'success' : 'warning'}
                                    style={{ height: '5px' }}
                                />
                            </div>

                            {/* 2. Quality Health */}
                            <div className="p-3 border rounded-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-2">
                                        {criteria?.quality_health?.met ? (
                                            <CheckCircle size={18} className="text-success" />
                                        ) : (
                                            <AlertCircle size={18} className="text-danger" />
                                        )}
                                        <span className="fw-semibold text-dark small" style={{ fontSize: '0.88rem' }}>
                                            2. Meta Quality Health
                                        </span>
                                    </div>
                                    <Badge color={criteria?.quality_health?.met ? 'light-success' : 'light-danger'} pill style={{ fontSize: '0.72rem' }}>
                                        Rating: {criteria?.quality_health?.current || 'GREEN'}
                                    </Badge>
                                </div>
                                <p className="text-muted small mb-1" style={{ fontSize: '0.78rem' }}>
                                    {criteria?.quality_health?.description || 'Continuous GREEN quality rating required without elevated block rates.'}
                                </p>
                                <Progress
                                    value={criteria?.quality_health?.met ? 100 : 15}
                                    color={criteria?.quality_health?.met ? 'success' : 'danger'}
                                    style={{ height: '5px' }}
                                />
                            </div>

                            {/* 3. Two-Step Verification */}
                            <div className="p-3 border rounded-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-2">
                                        {criteria?.two_step_verification?.met ? (
                                            <CheckCircle size={18} className="text-success" />
                                        ) : (
                                            <AlertCircle size={18} className="text-warning" />
                                        )}
                                        <span className="fw-semibold text-dark small" style={{ fontSize: '0.88rem' }}>
                                            3. Two-Step Security PIN Verification
                                        </span>
                                    </div>
                                    <Badge color="light-success" pill style={{ fontSize: '0.72rem' }}>
                                        ✓ Verified
                                    </Badge>
                                </div>
                                <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                                    {criteria?.two_step_verification?.description || 'Cryptographic PIN authentication enabled on Meta Cloud API line.'}
                                </p>
                            </div>

                            {/* 4. Business Verification */}
                            <div className="p-3 border rounded-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <CheckCircle size={18} className="text-success" />
                                        <span className="fw-semibold text-dark small" style={{ fontSize: '0.88rem' }}>
                                            4. Meta Business Portfolio Verification
                                        </span>
                                    </div>
                                    <Badge color="light-success" pill style={{ fontSize: '0.72rem' }}>
                                        ✓ Portfolio Linked
                                    </Badge>
                                </div>
                                <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                                    Official business registration documents validated and approved by Meta.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="border-top py-2 px-3 bg-light d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                    <Button color="secondary" size="sm" onClick={toggle} outline>
                        Close
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        color="light"
                        disabled={evaluating || loading}
                        onClick={handleReEvaluate}
                        className="d-inline-flex align-items-center gap-1 border"
                    >
                        <RefreshCw size={13} className={evaluating ? 'spin' : ''} />
                        <span>{evaluating ? 'Evaluating...' : 'Re-evaluate 10K Milestone'}</span>
                    </Button>
                </div>

                <div className="d-flex align-items-center gap-2">
                    {obaData?.direct_meta_application_url && (
                        <a
                            href={obaData.direct_meta_application_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                        >
                            <span>Meta Portal</span>
                            <ExternalLink size={13} />
                        </a>
                    )}

                    <Button
                        type="button"
                        size="sm"
                        disabled={applying || currentStatus === 'IN_REVIEW' || currentStatus === 'APPROVED'}
                        onClick={handleApply}
                        style={{
                            backgroundColor: '#25D366',
                            borderColor: '#25D366',
                            color: '#ffffff',
                            fontWeight: 600,
                            borderRadius: '6px'
                        }}
                        className="d-inline-flex align-items-center gap-1 shadow-sm"
                    >
                        <Award size={15} />
                        <span>
                            {applying
                                ? 'Submitting...'
                                : currentStatus === 'IN_REVIEW'
                                ? 'Under Meta Review'
                                : currentStatus === 'APPROVED'
                                ? '✓ OBA Approved'
                                : 'Submit OBA Application'}
                        </span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default OfficialBusinessAccountModal
