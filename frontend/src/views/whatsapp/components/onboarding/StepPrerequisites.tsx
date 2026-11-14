import React, { useState } from 'react'
import { Card, CardBody, Row, Col, Button, Badge } from 'reactstrap'
import { CheckCircle, Shield, Smartphone, Globe, ExternalLink, ArrowRight, Zap, Check, Layers } from 'react-feather'

interface StepPrerequisitesProps {
    signupMode: 'standard' | 'coexistence'
    setSignupMode: (mode: 'standard' | 'coexistence') => void
    onNext: () => void
    onClose: () => void
}

export const StepPrerequisites: React.FC<StepPrerequisitesProps> = ({
    signupMode,
    setSignupMode,
    onNext,
    onClose
}) => {
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
            {/* Onboarding Mode Selection (Two Distinct Options) */}
            <div className="mb-3">
                <span className="badge bg-light-primary text-primary fw-bold mb-1" style={{ fontSize: '0.75rem' }}>
                    Step 1: Choose Integration Architecture
                </span>
                <h5 className="fw-bolder mb-1" style={{ color: '#1e293b', fontSize: '1.2rem' }}>
                    Select WhatsApp Connection Mode
                </h5>
                <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                    Choose how you want to deploy your WhatsApp line with Meta Cloud API:
                </p>

                <Row className="g-2">
                    {/* Option 1: Standard Dedicated Cloud API */}
                    <Col xs="12" md="6">
                        <Card
                            className={`border rounded-3 cursor-pointer h-100 transition-all ${
                                signupMode === 'standard' ? 'shadow-sm' : ''
                            }`}
                            onClick={() => setSignupMode('standard')}
                            style={{
                                borderColor: signupMode === 'standard' ? '#ff8c21' : '#e2e8f0',
                                backgroundColor: signupMode === 'standard' ? '#fffaf5' : '#ffffff',
                                borderWidth: signupMode === 'standard' ? '1.5px' : '1px'
                            }}
                        >
                            <CardBody className="p-3 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div
                                            className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                backgroundColor: '#fff7ed',
                                                color: '#ff8c21'
                                            }}
                                        >
                                            <Zap size={18} />
                                        </div>
                                        <Badge color={signupMode === 'standard' ? 'warning' : 'light-secondary'} pill style={{ fontSize: '0.7rem' }}>
                                            High Volume API
                                        </Badge>
                                    </div>
                                    <h6 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '0.95rem' }}>
                                        Dedicated Cloud API Line
                                    </h6>
                                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                                        Direct standalone connection to Meta Cloud API v22.0. Max throughput for bulk broadcasts and AI chatbots.
                                    </p>
                                </div>
                                <div className="pt-2 mt-2 border-top d-flex align-items-center justify-content-between">
                                    <span className="small fw-semibold text-muted" style={{ fontSize: '0.75rem' }}>
                                        Fresh / Virtual Number
                                    </span>
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: signupMode === 'standard' ? '#ff8c21' : '#cbd5e1',
                                            color: '#ffffff'
                                        }}
                                    >
                                        {signupMode === 'standard' && <Check size={12} />}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Option 2: WhatsApp Co-Existence Mode */}
                    <Col xs="12" md="6">
                        <Card
                            className={`border rounded-3 cursor-pointer h-100 transition-all ${
                                signupMode === 'coexistence' ? 'shadow-sm' : ''
                            }`}
                            onClick={() => setSignupMode('coexistence')}
                            style={{
                                borderColor: signupMode === 'coexistence' ? '#ff8c21' : '#e2e8f0',
                                backgroundColor: signupMode === 'coexistence' ? '#f0fdf4' : '#ffffff',
                                borderWidth: signupMode === 'coexistence' ? '1.5px' : '1px'
                            }}
                        >
                            <CardBody className="p-3 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div
                                            className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                backgroundColor: '#dcfce7',
                                                color: '#16a34a'
                                            }}
                                        >
                                            <Layers size={18} />
                                        </div>
                                        <Badge color={signupMode === 'coexistence' ? 'success' : 'light-secondary'} pill style={{ fontSize: '0.7rem' }}>
                                            App + API Co-Existence
                                        </Badge>
                                    </div>
                                    <h6 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '0.95rem' }}>
                                        Co-Existence Mode (App + API)
                                    </h6>
                                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                                        Keep your phone's official WhatsApp Business App active, WHILE managing chats and campaigns in KradChat!
                                    </p>
                                </div>
                                <div className="pt-2 mt-2 border-top d-flex align-items-center justify-content-between">
                                    <span className="small fw-semibold text-muted" style={{ fontSize: '0.75rem' }}>
                                        No Phone App Deletion
                                    </span>
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: signupMode === 'coexistence' ? '#16a34a' : '#cbd5e1',
                                            color: '#ffffff'
                                        }}
                                    >
                                        {signupMode === 'coexistence' && <Check size={12} />}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Pre-Flight Readiness Checklist */}
            <div className="mb-2">
                <h6 className="fw-bolder mb-1" style={{ color: '#2d3748', fontSize: '0.95rem' }}>
                    Readiness Verification Checklist
                </h6>
            </div>

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
                                        width: '36px',
                                        height: '36px',
                                        backgroundColor: '#eff6ff',
                                        color: '#2563eb'
                                    }}
                                >
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0" style={{ fontSize: '0.88rem', color: '#1e293b' }}>
                                        Meta Business Portfolio Admin
                                    </h6>
                                    <small className="text-muted">
                                        Admin access to your Meta Business Account with permissions for WhatsApp.
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: checkedItems.businessManager ? '#ff8c21' : '#cbd5e1',
                                        color: '#ffffff'
                                    }}
                                >
                                    <Check size={12} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* 2. Phone Line (OTP or Mobile App) */}
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
                                        width: '36px',
                                        height: '36px',
                                        backgroundColor: '#ecfdf5',
                                        color: '#059669'
                                    }}
                                >
                                    <Smartphone size={18} />
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0" style={{ fontSize: '0.88rem', color: '#1e293b' }}>
                                        {signupMode === 'coexistence' ? 'Active WhatsApp Business App' : 'Dedicated Phone Line (OTP Ready)'}
                                    </h6>
                                    <small className="text-muted">
                                        {signupMode === 'coexistence'
                                            ? 'Phone number currently active on your phone’s WhatsApp Business application.'
                                            : 'Able to receive SMS or voice OTP verification code.'}
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: checkedItems.phoneNumber ? '#ff8c21' : '#cbd5e1',
                                        color: '#ffffff'
                                    }}
                                >
                                    <Check size={12} />
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
                                        width: '36px',
                                        height: '36px',
                                        backgroundColor: '#f5f3ff',
                                        color: '#7c3aed'
                                    }}
                                >
                                    <Globe size={18} />
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0" style={{ fontSize: '0.88rem', color: '#1e293b' }}>
                                        Official Brand Display Name
                                    </h6>
                                    <small className="text-muted">
                                        Matches legal trade name or branding documentation (e.g. <strong>KRAD Technology</strong>).
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: checkedItems.displayName ? '#ff8c21' : '#cbd5e1',
                                        color: '#ffffff'
                                    }}
                                >
                                    <Check size={12} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

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
                    <span>Configure Profile & Next</span>
                    <ArrowRight size={15} />
                </Button>
            </div>
        </div>
    )
}
export default StepPrerequisites
