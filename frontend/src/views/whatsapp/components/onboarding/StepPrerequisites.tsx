import React, { useState } from 'react'
import { Card, CardBody, Row, Col, Button, Badge } from 'reactstrap'
import { CheckCircle, Shield, Smartphone, Globe, ExternalLink, ArrowRight, Zap, Check } from 'react-feather'

interface StepPrerequisitesProps {
    onNext: () => void
    onClose: () => void
}

export const StepPrerequisites: React.FC<StepPrerequisitesProps> = ({ onNext, onClose }) => {
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
        businessManager: true,
        phoneNumber: true,
        displayName: true
    })

    const toggleItem = (key: string) => {
        setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const allChecked = Object.values(checkedItems).every(Boolean)

    return (
        <div className="py-1">
            {/* Top Banner: Meta Cloud API v22.0 Feature Highlights */}
            <div
                className="p-3 mb-3 rounded-3"
                style={{
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    border: '1px solid #fed7aa'
                }}
            >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: '32px', height: '32px', backgroundColor: '#ff8c21' }}
                        >
                            <Zap size={16} />
                        </div>
                        <div>
                            <h6 className="fw-bolder mb-0" style={{ color: '#9a3412', fontSize: '1rem' }}>
                                Direct Meta WhatsApp Cloud API v22.0
                            </h6>
                            <small style={{ color: '#c2410c' }}>
                                Fast, secure enterprise onboarding with zero middleman markups.
                            </small>
                        </div>
                    </div>
                    <Badge
                        color="success"
                        pill
                        className="py-1 px-2 d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.75rem', fontWeight: 600 }}
                    >
                        <Check size={12} /> Live API Ready
                    </Badge>
                </div>

                <div className="d-flex align-items-center gap-3 text-muted flex-wrap" style={{ fontSize: '0.78rem' }}>
                    <span className="d-inline-flex align-items-center gap-1" style={{ color: '#9a3412' }}>
                        <Shield size={13} /> Official Meta BSP Architecture
                    </span>
                    <span className="d-inline-flex align-items-center gap-1" style={{ color: '#9a3412' }}>
                        <Globe size={13} /> Global High Delivery (99.9%)
                    </span>
                    <span className="d-inline-flex align-items-center gap-1" style={{ color: '#9a3412' }}>
                        <Smartphone size={13} /> Multi-Number Line Support
                    </span>
                </div>
            </div>

            {/* Headline and Context */}
            <div className="mb-3">
                <h5 className="fw-bolder mb-1" style={{ color: '#2d3748', fontSize: '1.15rem' }}>
                    Pre-Flight Readiness Checklist
                </h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.86rem' }}>
                    Verify these three core requirements before initiating Meta Embedded authorization:
                </p>
            </div>

            {/* Interactive Requirement Cards */}
            <Row className="g-2 mb-3">
                {/* 1. Meta Business Portfolio Admin */}
                <Col xs="12">
                    <Card
                        className={`border rounded-3 transition-all cursor-pointer ${
                            checkedItems.businessManager ? 'shadow-sm' : ''
                        }`}
                        onClick={() => toggleItem('businessManager')}
                        style={{
                            borderColor: checkedItems.businessManager ? '#ff8c21' : '#e2e8f0',
                            backgroundColor: checkedItems.businessManager ? '#ffffff' : '#f8fafc'
                        }}
                    >
                        <CardBody className="p-2 p-sm-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        backgroundColor: '#eff6ff',
                                        color: '#2563eb'
                                    }}
                                >
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0" style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                                        Meta Business Portfolio Admin
                                    </h6>
                                    <small className="text-muted">
                                        Full management access to your Facebook Business Manager portfolio.
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <Badge
                                    color={checkedItems.businessManager ? 'light-success' : 'light-secondary'}
                                    className="d-none d-sm-inline-flex py-1 px-2"
                                    style={{ fontSize: '0.72rem' }}
                                >
                                    {checkedItems.businessManager ? '✓ Verified' : 'Check'}
                                </Badge>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        backgroundColor: checkedItems.businessManager ? '#ff8c21' : '#cbd5e1',
                                        color: '#ffffff'
                                    }}
                                >
                                    <Check size={14} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* 2. Dedicated Phone Number (OTP Ready) */}
                <Col xs="12">
                    <Card
                        className={`border rounded-3 transition-all cursor-pointer ${
                            checkedItems.phoneNumber ? 'shadow-sm' : ''
                        }`}
                        onClick={() => toggleItem('phoneNumber')}
                        style={{
                            borderColor: checkedItems.phoneNumber ? '#ff8c21' : '#e2e8f0',
                            backgroundColor: checkedItems.phoneNumber ? '#ffffff' : '#f8fafc'
                        }}
                    >
                        <CardBody className="p-2 p-sm-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        backgroundColor: '#ecfdf5',
                                        color: '#059669'
                                    }}
                                >
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0" style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                                        Dedicated Phone Number (OTP Ready)
                                    </h6>
                                    <small className="text-muted">
                                        Can receive SMS or Voice OTP. Cannot be registered on personal WhatsApp app.
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <Badge
                                    color={checkedItems.phoneNumber ? 'light-success' : 'light-secondary'}
                                    className="d-none d-sm-inline-flex py-1 px-2"
                                    style={{ fontSize: '0.72rem' }}
                                >
                                    {checkedItems.phoneNumber ? '✓ OTP Ready' : 'Check'}
                                </Badge>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        backgroundColor: checkedItems.phoneNumber ? '#ff8c21' : '#cbd5e1',
                                        color: '#ffffff'
                                    }}
                                >
                                    <Check size={14} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* 3. Official Brand Display Name */}
                <Col xs="12">
                    <Card
                        className={`border rounded-3 transition-all cursor-pointer ${
                            checkedItems.displayName ? 'shadow-sm' : ''
                        }`}
                        onClick={() => toggleItem('displayName')}
                        style={{
                            borderColor: checkedItems.displayName ? '#ff8c21' : '#e2e8f0',
                            backgroundColor: checkedItems.displayName ? '#ffffff' : '#f8fafc'
                        }}
                    >
                        <CardBody className="p-2 p-sm-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        backgroundColor: '#f5f3ff',
                                        color: '#7c3aed'
                                    }}
                                >
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0" style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                                        Official Brand Display Name
                                    </h6>
                                    <small className="text-muted">
                                        Brand name matching your legal documents (e.g. <strong>KRAD Technology</strong>).
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <Badge
                                    color={checkedItems.displayName ? 'light-success' : 'light-secondary'}
                                    className="d-none d-sm-inline-flex py-1 px-2"
                                    style={{ fontSize: '0.72rem' }}
                                >
                                    {checkedItems.displayName ? '✓ Verified' : 'Check'}
                                </Badge>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        backgroundColor: checkedItems.displayName ? '#ff8c21' : '#cbd5e1',
                                        color: '#ffffff'
                                    }}
                                >
                                    <Check size={14} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Meta Display Name Guidelines Helper */}
            <div className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-light mb-3">
                <span className="small text-muted" style={{ fontSize: '0.8rem' }}>
                    Need help matching Meta's strict display name policies?
                </span>
                <a
                    href="https://www.facebook.com/business/help/529612240923421"
                    target="_blank"
                    rel="noreferrer"
                    className="small fw-semibold d-inline-flex align-items-center gap-1 text-decoration-none"
                    style={{ color: '#ff8c21', fontSize: '0.8rem' }}
                >
                    <span>Meta Guidelines</span>
                    <ExternalLink size={12} />
                </a>
            </div>

            {/* Modal Navigation Buttons */}
            <div className="d-flex flex-column-reverse flex-sm-row justify-content-end align-items-stretch align-items-sm-center gap-2 pt-2 border-top">
                <Button
                    color="secondary"
                    outline
                    type="button"
                    onClick={onClose}
                    className="w-100 w-sm-auto"
                    style={{
                        borderRadius: '6px',
                        padding: '0.55rem 1.5rem',
                        fontWeight: 500,
                        borderColor: '#cbd5e1',
                        color: '#475569'
                    }}
                >
                    Close
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={!allChecked}
                    className="w-100 w-sm-auto d-inline-flex align-items-center justify-content-center gap-1 shadow-sm"
                    style={{
                        backgroundColor: '#ff8c21',
                        borderColor: '#ff8c21',
                        color: '#ffffff',
                        borderRadius: '6px',
                        padding: '0.55rem 1.85rem',
                        fontWeight: 600,
                        opacity: allChecked ? 1 : 0.6
                    }}
                >
                    <span>Continue to Profile Setup</span>
                    <ArrowRight size={15} />
                </Button>
            </div>
        </div>
    )
}
export default StepPrerequisites
