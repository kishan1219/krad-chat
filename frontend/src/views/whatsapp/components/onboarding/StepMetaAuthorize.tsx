import React, { useState } from 'react'
import { Row, Col, Button, Alert, Card, CardBody, Badge } from 'reactstrap'
import { Shield, CheckCircle, ExternalLink, ArrowLeft } from 'react-feather'
import { PhoneMockup } from './PhoneMockup'
import { MetaOnboardingConfig } from '../../../../services/whatsappService'

interface StepMetaAuthorizeProps {
    name?: string
    config?: MetaOnboardingConfig | null
    busy: boolean
    onBack: () => void
    onConnectLive: () => void
    onConnectSandbox?: () => void
}

export const StepMetaAuthorize: React.FC<StepMetaAuthorizeProps> = ({
    name = '',
    config,
    busy,
    onBack,
    onConnectLive,
    onConnectSandbox
}) => {
    const [imgError, setImgError] = useState(false)
    let brandImgUrl = ''
    try {
        brandImgUrl = require('../../../../assets/images/logo/Brand.png')?.default || require('../../../../assets/images/logo/Brand.png')
    } catch {
        brandImgUrl = ''
    }

    const businessName = name.trim() || 'Krad Technology'

    return (
        <div className="py-1">
            <Row className="align-items-center g-3">
                {/* Left: Modern Meta Embedded Signup Launch Card */}
                <Col md="7" sm="12">
                    <div className="mb-2">
                        <span className="badge bg-light-primary text-primary fw-bold mb-1" style={{ fontSize: '0.75rem' }}>
                            Final Step: Meta Authorization
                        </span>
                        <h4 className="fw-bolder mb-1" style={{ color: '#1e293b', fontSize: '1.25rem' }}>
                            Connect with Meta WhatsApp Business
                        </h4>
                        <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                            Authenticate your Facebook Business Account to grant secure WhatsApp messaging permissions.
                        </p>
                    </div>

                    {/* Pre-flight Connection Summary Card */}
                    <Card className="border rounded-3 mb-3 shadow-none" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                        <CardBody className="p-3">
                            <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Connection Parameters
                            </h6>
                            <div className="d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Display Name:</span>
                                    <span className="fw-semibold text-dark">{businessName}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Cloud API Version:</span>
                                    <Badge color="light-info" pill style={{ fontSize: '0.72rem' }}>
                                        Graph v22.0
                                    </Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Security & Permissions:</span>
                                    <span className="text-success fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                                        <CheckCircle size={13} /> Direct Meta OAuth 2.0
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Meta Official CTA Button */}
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
                        <small className="text-muted text-center d-block mt-1" style={{ fontSize: '0.75rem' }}>
                            Opens Meta's secure embedded dialog to link your business portfolio.
                        </small>
                    </div>

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

                {/* Right: Interactive Phone Mockup Preview */}
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
