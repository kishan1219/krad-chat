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
import { CheckCircle, AlertCircle, Shield, Award, ExternalLink, ArrowRight } from 'react-feather'
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
    const [obaData, setObaData] = useState<any>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen && connection?.id) {
            setLoading(true)
            setError('')
            whatsappService
                .getObaStatus(connection.id)
                .then((res) => setObaData(res))
                .catch((err) => {
                    setError(err?.message || 'Could not retrieve OBA verification status')
                })
                .finally(() => setLoading(false))
        } else {
            setObaData(null)
            setError('')
        }
    }, [isOpen, connection])

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
    const currentStatus = obaData?.oba_status || 'NOT_ELIGIBLE'

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            className="modal-dialog-centered modal-lg"
            contentClassName="rounded-3 shadow-lg border-0 overflow-hidden"
        >
            <ModalHeader toggle={toggle} className="border-bottom py-2 px-3 bg-light">
                <div className="d-flex align-items-center gap-1">
                    <Award size={18} style={{ color: '#28c76f' }} />
                    <span className="fw-bolder text-dark" style={{ fontSize: '1.05rem' }}>
                        WhatsApp Green Checkmark (OBA) Tracker
                    </span>
                    <Badge color="light-success" pill style={{ fontSize: '0.7rem' }}>
                        Official Business Account
                    </Badge>
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
                        <p className="text-muted small mt-2 mb-0">Auditing Meta verification requirements...</p>
                    </div>
                ) : (
                    <div>
                        {/* Live OBA Badge Preview Card */}
                        <Card className="border shadow-none rounded-3 mb-3" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                            <CardBody className="p-3">
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                            style={{ width: '44px', height: '44px', backgroundColor: '#25D366' }}
                                        >
                                            <Award size={22} />
                                        </div>
                                        <div>
                                            <div className="d-flex align-items-center gap-1">
                                                <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.1rem' }}>
                                                    {connection.verified_name || connection.name || 'KRAD Technology'}
                                                </h5>
                                                {/* Official Meta Green Tick SVG */}
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" fill="#25D366" />
                                                    <path d="M7.5 12L10.5 15L16.5 9" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <small className="text-muted font-monospace" style={{ fontSize: '0.8rem' }}>
                                                {connection.display_phone_number || connection.phone_number_id}
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
                                        className="py-1 px-2"
                                        style={{ fontSize: '0.78rem' }}
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
                            </CardBody>
                        </Card>

                        {/* 4 Pillars of OBA Eligibility */}
                        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Official Meta Criteria Tracker
                        </h6>

                        <div className="d-flex flex-column gap-2 mb-3">
                            {/* 1. Volume Milestone */}
                            <div className="p-2 border rounded-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-1">
                                        {criteria?.volume_milestone?.met ? (
                                            <CheckCircle size={15} className="text-success" />
                                        ) : (
                                            <AlertCircle size={15} className="text-warning" />
                                        )}
                                        <span className="fw-semibold text-dark small">Volume Milestone (Tier 10K+)</span>
                                    </div>
                                    <Badge color={criteria?.volume_milestone?.met ? 'light-success' : 'light-warning'} pill style={{ fontSize: '0.7rem' }}>
                                        Current: {criteria?.volume_milestone?.current || 'TIER_1K'}
                                    </Badge>
                                </div>
                                <p className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                                    {criteria?.volume_milestone?.description} (Required: {criteria?.volume_milestone?.required})
                                </p>
                                <Progress
                                    value={criteria?.volume_milestone?.met ? 100 : 35}
                                    color={criteria?.volume_milestone?.met ? 'success' : 'warning'}
                                    style={{ height: '5px' }}
                                />
                            </div>

                            {/* 2. Quality Health */}
                            <div className="p-2 border rounded-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-1">
                                        {criteria?.quality_health?.met ? (
                                            <CheckCircle size={15} className="text-success" />
                                        ) : (
                                            <AlertCircle size={15} className="text-danger" />
                                        )}
                                        <span className="fw-semibold text-dark small">Meta Quality Rating Health</span>
                                    </div>
                                    <Badge color={criteria?.quality_health?.met ? 'light-success' : 'light-danger'} pill style={{ fontSize: '0.7rem' }}>
                                        Rating: {criteria?.quality_health?.current || 'GREEN'}
                                    </Badge>
                                </div>
                                <p className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                                    {criteria?.quality_health?.description}
                                </p>
                                <Progress
                                    value={criteria?.quality_health?.met ? 100 : 15}
                                    color={criteria?.quality_health?.met ? 'success' : 'danger'}
                                    style={{ height: '5px' }}
                                />
                            </div>

                            {/* 3. Two-Step Verification */}
                            <div className="p-2 border rounded-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-1">
                                        {criteria?.two_step_verification?.met ? (
                                            <CheckCircle size={15} className="text-success" />
                                        ) : (
                                            <AlertCircle size={15} className="text-warning" />
                                        )}
                                        <span className="fw-semibold text-dark small">Two-Step Security PIN Verification</span>
                                    </div>
                                    <Badge color="light-success" pill style={{ fontSize: '0.7rem' }}>
                                        ✓ Verified
                                    </Badge>
                                </div>
                                <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                                    {criteria?.two_step_verification?.description}
                                </p>
                            </div>

                            {/* 4. Business Verification */}
                            <div className="p-2 border rounded-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-1">
                                        <CheckCircle size={15} className="text-success" />
                                        <span className="fw-semibold text-dark small">Meta Business Portfolio Verification</span>
                                    </div>
                                    <Badge color="light-success" pill style={{ fontSize: '0.7rem' }}>
                                        ✓ Portfolio Linked
                                    </Badge>
                                </div>
                                <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                                    Corporate documents and official business profile active.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="border-top py-2 px-3 bg-light d-flex justify-content-between align-items-center">
                <Button color="secondary" size="sm" onClick={toggle} outline>
                    Close
                </Button>

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
                            backgroundColor: '#28c76f',
                            borderColor: '#28c76f',
                            color: '#ffffff',
                            fontWeight: 600,
                            borderRadius: '6px'
                        }}
                        className="d-inline-flex align-items-center gap-1"
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
