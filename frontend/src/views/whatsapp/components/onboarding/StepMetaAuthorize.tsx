import React, { useState } from 'react'
import { Row, Col, Button, Alert } from 'reactstrap'
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

    return (
        <div className="py-1">
            <Row className="align-items-center">
                {/* Left instructions matching user screenshot */}
                <Col md="7" sm="12" className="mb-2 mb-md-0">
                    <h3
                        className="fw-bolder mb-1"
                        style={{ color: '#5e5873', fontSize: '1.35rem', lineHeight: 1.3 }}
                    >
                        Create your WhatsApp Business Account
                    </h3>
                    <p className="text-muted mb-1" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
                        To continue you need to access your Facebook business account, as well as.
                    </p>
                    <ol
                        style={{
                            paddingLeft: '1.25rem',
                            color: '#6e6b7b',
                            fontSize: '0.88rem',
                            lineHeight: 1.85
                        }}
                    >
                        <li>Your company’s legal name and address</li>
                        <li>A display name and short description</li>
                        <li>
                            A phone number you have access to, own by your business. Don’t have one?{' '}
                            <a
                                href="https://www.whatsapp.com/contact"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#ff8c21', textDecoration: 'none', fontWeight: 600 }}
                            >
                                Contact Support
                            </a>
                        </li>
                    </ol>

                    {config?.simulated && (
                        <Alert color="warning" className="p-1 mt-2 mb-0" style={{ fontSize: '0.82rem' }}>
                            <div className="fw-bold mb-50">Development Mode Detected:</div>
                            Meta credentials are not set on this server. Sandbox simulation is ready.
                            {onConnectSandbox && (
                                <div className="mt-50">
                                    <button
                                        type="button"
                                        onClick={onConnectSandbox}
                                        className="btn btn-link btn-sm p-0 text-decoration-underline"
                                        style={{ color: '#ff8c21', fontWeight: 600 }}
                                    >
                                        Launch Instant Sandbox Simulation
                                    </button>
                                </div>
                            )}
                        </Alert>
                    )}
                </Col>

                {/* Right phone mockup preview */}
                <Col md="5" sm="12" className="text-center">
                    {!imgError && brandImgUrl ? (
                        <img
                            src={brandImgUrl}
                            alt="WhatsApp Business Preview"
                            onError={() => setImgError(true)}
                            style={{
                                maxHeight: '380px',
                                width: 'auto',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                display: 'inline-block',
                                borderRadius: '24px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                            }}
                        />
                    ) : (
                        <div className="d-flex justify-content-center">
                            <PhoneMockup
                                name={name}
                                enableAutoResponse={true}
                                autoResponseMessage="Hello! Welcome to our WhatsApp service."
                            />
                        </div>
                    )}
                </Col>
            </Row>

            {/* Footer Buttons */}
            <div className="d-flex justify-content-end align-items-center gap-2 pt-2 border-top mt-3">
                <Button
                    color="secondary"
                    outline
                    type="button"
                    onClick={onBack}
                    style={{
                        borderRadius: '6px',
                        padding: '0.6rem 1.75rem',
                        fontWeight: 500,
                        borderColor: '#b9b9c3',
                        color: '#6e6b7b'
                    }}
                >
                    Back
                </Button>
                <Button
                    type="button"
                    disabled={busy}
                    onClick={onConnectLive}
                    style={{
                        backgroundColor: '#ff8c21',
                        borderColor: '#ff8c21',
                        color: '#ffffff',
                        borderRadius: '6px',
                        padding: '0.6rem 2.25rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 6px rgba(255,140,33,0.3)'
                    }}
                >
                    {busy ? 'Connecting...' : 'Continue With Facebook'}
                </Button>
            </div>
        </div>
    )
}
