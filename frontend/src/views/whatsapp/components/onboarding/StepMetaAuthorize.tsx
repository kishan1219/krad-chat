import React, { useState } from 'react'
import { Row, Col, Button, Alert, Card, CardBody, Badge, Input, Label } from 'reactstrap'
import { Shield, CheckCircle, ArrowLeft, Check, Layers, Zap, Smartphone } from 'react-feather'
import { PhoneMockup } from './PhoneMockup'
import { MetaOnboardingConfig } from '../../../../services/whatsappService'

interface StepMetaAuthorizeProps {
    name?: string
    signupMode?: 'standard' | 'coexistence'
    config?: MetaOnboardingConfig | null
    busy: boolean
    capturedCode?: string
    capturedAssets?: { waba_id: string; phone_number_id: string } | null
    onBack: () => void
    onConnectLive: () => void
    onConnectSandbox?: () => void
    onManualSave?: (wabaId?: string, phoneId?: string) => void
}

export const StepMetaAuthorize: React.FC<StepMetaAuthorizeProps> = ({
    name = '',
    signupMode = 'standard',
    config,
    busy,
    capturedCode = '',
    capturedAssets = null,
    onBack,
    onConnectLive,
    onConnectSandbox,
    onManualSave
}) => {
    const [imgError, setImgError] = useState(false)
    const [manualWabaId, setManualWabaId] = useState(capturedAssets?.waba_id || '')
    const [manualPhoneId, setManualPhoneId] = useState(capturedAssets?.phone_number_id || '1369567429576618')
    const [showManualFields, setShowManualFields] = useState(true)

    let brandImgUrl = ''
    try {
        brandImgUrl = require('../../../../assets/images/logo/Brand.png')?.default || require('../../../../assets/images/logo/Brand.png')
    } catch {
        brandImgUrl = ''
    }

    const businessName = name.trim() || 'KRAD Technology'
    const isAuthorized = Boolean(capturedCode || (capturedAssets?.phone_number_id && capturedAssets?.waba_id))

    return (
        <div className="py-1">
            <Row className="align-items-center g-3">
                {/* Left Column: Authorization & Explicit Save Card */}
                <Col md="7" sm="12">
                    <div className="mb-2">
                        <div className="d-flex align-items-center gap-1 mb-1">
                            <Badge color={signupMode === 'coexistence' ? 'light-success' : 'light-primary'} pill style={{ fontSize: '0.75rem' }}>
                                {signupMode === 'coexistence' ? 'Co-Existence Mode' : 'Dedicated Line'}
                            </Badge>
                            <Badge color="light-info" pill style={{ fontSize: '0.75rem' }}>
                                Graph v22.0
                            </Badge>
                        </div>
                        <h4 className="fw-bolder mb-1" style={{ color: '#1e293b', fontSize: '1.25rem' }}>
                            {isAuthorized ? 'Complete & Save Connection' : 'Authorize with Meta WhatsApp'}
                        </h4>
                        <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                            {signupMode === 'coexistence'
                                ? 'Authorize via Meta Embedded Signup to link your existing WhatsApp Business mobile app.'
                                : 'Grant secure Meta permissions to enable high-speed Cloud API messaging for your brand.'}
                        </p>
                    </div>

                    {/* Pre-flight / Post-auth Connection Summary Card */}
                    <Card
                        className="border rounded-3 mb-3 shadow-none"
                        style={{
                            backgroundColor: isAuthorized ? '#f0fdf4' : '#f8fafc',
                            borderColor: isAuthorized ? '#86efac' : '#e2e8f0'
                        }}
                    >
                        <CardBody className="p-3">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {isAuthorized ? '✓ Meta Authorization Verified' : 'Connection Parameters'}
                                </h6>
                                {isAuthorized && (
                                    <Badge color="success" pill style={{ fontSize: '0.7rem' }}>
                                        Ready to Save
                                    </Badge>
                                )}
                            </div>

                            <div className="d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Brand Name:</span>
                                    <span className="fw-semibold text-dark">{businessName}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Architecture:</span>
                                    <span className="fw-semibold text-dark">
                                        {signupMode === 'coexistence' ? 'WhatsApp Business App + Cloud API' : 'Dedicated Cloud API Line'}
                                    </span>
                                </div>
                                {capturedAssets?.waba_id && (
                                    <div className="d-flex justify-content-between align-items-center font-monospace">
                                        <span className="text-muted">WABA ID:</span>
                                        <span className="fw-semibold text-dark">{capturedAssets.waba_id}</span>
                                    </div>
                                )}
                                {capturedAssets?.phone_number_id && (
                                    <div className="d-flex justify-content-between align-items-center font-monospace">
                                        <span className="text-muted">Phone Number ID:</span>
                                        <span className="fw-semibold text-dark">{capturedAssets.phone_number_id}</span>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Primary Action Buttons */}
                    {isAuthorized ? (
                        /* Explicit Save Connection Button */
                        <div className="mb-3">
                            <div className="p-2 border rounded-2 mb-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                                <div className="fw-semibold text-dark small mb-1">Verify Connection IDs (Meta Business):</div>
                                <Row className="g-1 mb-1">
                                    <Col xs="6">
                                        <Label className="small mb-0 text-muted" style={{ fontSize: '0.72rem' }}>WABA ID (Auto-detect if blank)</Label>
                                        <Input
                                            bsSize="sm"
                                            placeholder="Auto-detected"
                                            value={manualWabaId}
                                            onChange={(e) => setManualWabaId(e.target.value)}
                                        />
                                    </Col>
                                    <Col xs="6">
                                        <Label className="small mb-0 text-muted" style={{ fontSize: '0.72rem' }}>Phone Number ID</Label>
                                        <Input
                                            bsSize="sm"
                                            placeholder="1369567429576618"
                                            value={manualPhoneId}
                                            onChange={(e) => setManualPhoneId(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <Button
                                type="button"
                                disabled={busy}
                                onClick={() => onManualSave?.(manualWabaId, manualPhoneId)}
                                className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                style={{
                                    backgroundColor: '#ff8c21',
                                    borderColor: '#ff8c21',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    boxShadow: '0 3px 10px rgba(255,140,33,0.35)'
                                }}
                            >
                                <Check size={18} />
                                <span>{busy ? 'Saving to KradChat...' : 'Save & Activate WhatsApp Line'}</span>
                            </Button>
                            <small className="text-success text-center d-block mt-1 fw-semibold" style={{ fontSize: '0.78rem' }}>
                                ✓ Meta authorization received! Click above to save into KradChat.
                            </small>
                        </div>
                    ) : (
                        /* Official Continue with Facebook Button */
                        <div className="mb-2">
                            <Button
                                type="button"
                                disabled={busy}
                                onClick={onConnectLive}
                                className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                style={{
                                    backgroundColor: '#1877F2',
                                    borderColor: '#1877F2',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '0.95rem'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                <span>{busy ? 'Opening Meta Auth...' : 'Continue with Facebook'}</span>
                            </Button>
                            <div className="d-flex align-items-center justify-content-between mt-1 px-1">
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    Opens Meta's secure embedded popup
                                </small>
                                <button
                                    type="button"
                                    onClick={() => setShowManualFields(!showManualFields)}
                                    className="btn btn-link btn-sm p-0 text-decoration-none"
                                    style={{ color: '#ff8c21', fontSize: '0.75rem', fontWeight: 600 }}
                                >
                                    {showManualFields ? 'Hide manual entry' : 'I finished popup - Save now'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Manual Fallback Entry if popup finished but postMessage was blocked */}
                    {showManualFields && !isAuthorized && (
                        <Card className="border rounded-3 p-2 mb-2 bg-light shadow-none">
                            <h6 className="small fw-bold text-dark mb-1">Enter IDs from Meta Dashboard:</h6>
                            <Row className="g-1 mb-2">
                                <Col xs="6">
                                    <Label className="small mb-0 text-muted">WABA ID</Label>
                                    <Input
                                        bsSize="sm"
                                        placeholder="e.g. 109876543210987"
                                        value={manualWabaId}
                                        onChange={(e) => setManualWabaId(e.target.value)}
                                    />
                                </Col>
                                <Col xs="6">
                                    <Label className="small mb-0 text-muted">Phone Number ID</Label>
                                    <Input
                                        bsSize="sm"
                                        placeholder="e.g. 105592837482"
                                        value={manualPhoneId}
                                        onChange={(e) => setManualPhoneId(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Button
                                size="sm"
                                style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff' }}
                                disabled={!manualPhoneId || !manualWabaId || busy}
                                onClick={() => onManualSave?.(manualWabaId, manualPhoneId)}
                                className="fw-semibold"
                            >
                                Save Connection Now
                            </Button>
                        </Card>
                    )}

                    {config?.simulated && (
                        <Alert color="warning" className="p-2 mt-2 mb-0 rounded-2" style={{ fontSize: '0.82rem' }}>
                            <div className="fw-bold mb-1">Development Mode Detected:</div>
                            Meta credentials are not set on this server. Sandbox simulation is ready.
                            {onConnectSandbox && (
                                <div className="mt-1">
                                    <button
                                        type="button"
                                        onClick={onConnectSandbox}
                                        className="btn btn-sm btn-link p-0 text-decoration-underline fw-bold"
                                        style={{ color: '#ff8c21' }}
                                    >
                                        Launch Instant Sandbox Simulation →
                                    </button>
                                </div>
                            )}
                        </Alert>
                    )}
                </Col>

                {/* Right Column: Phone Mockup Preview */}
                <Col md="5" className="d-none d-md-block text-center">
                    {!imgError && brandImgUrl ? (
                        <img
                            src={brandImgUrl}
                            alt="WhatsApp Business Preview"
                            onError={() => setImgError(true)}
                            style={{
                                maxHeight: '340px',
                                width: 'auto',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                display: 'inline-block',
                                borderRadius: '20px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }}
                        />
                    ) : (
                        <div className="d-flex justify-content-center">
                            <PhoneMockup
                                name={businessName}
                                enableAutoResponse={true}
                                autoResponseMessage="Hello! Welcome to our WhatsApp service."
                            />
                        </div>
                    )}
                </Col>
            </Row>

            {/* Modal Navigation Buttons */}
            <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-3">
                <Button
                    color="secondary"
                    outline
                    type="button"
                    onClick={onBack}
                    className="d-inline-flex align-items-center gap-1"
                    style={{
                        borderRadius: '6px',
                        padding: '0.55rem 1.5rem',
                        fontWeight: 500,
                        borderColor: '#cbd5e1',
                        color: '#475569'
                    }}
                >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                </Button>
                <span className="small text-muted d-none d-sm-inline" style={{ fontSize: '0.78rem' }}>
                    <Shield size={12} className="me-1 text-success" />
                    Encrypted Token Storage
                </span>
            </div>
        </div>
    )
}
export default StepMetaAuthorize
