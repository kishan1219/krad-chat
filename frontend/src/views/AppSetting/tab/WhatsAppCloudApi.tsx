// @ts-nocheck
import React, { useState } from 'react'
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Row,
    Col,
    Button,
    Badge,
    Alert
} from 'reactstrap'
import {
    Smartphone,
    Zap,
    Key,
    Shield,
    ExternalLink,
    HelpCircle,
    CheckCircle
} from 'react-feather'
import Connections from '../../whatsapp/Connections'

interface WhatsAppCloudApiProps {
    activeTab: string
}

export default function WhatsAppCloudApi({ activeTab }: WhatsAppCloudApiProps) {
    const [helpOpen, setHelpOpen] = useState(false)

    return (
        <div className='whatsapp-cloud-api-tab'>
            {/* Overview / Introduction Card */}
            <Card className='border-0 shadow-sm mb-3 rounded-2xl'>
                <CardBody className='p-3'>
                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-2'>
                        <div className='d-flex align-items-center gap-2'>
                            <div
                                className='p-2 rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center'
                                style={{ width: 44, height: 44 }}
                            >
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <div className='d-flex align-items-center gap-2'>
                                    <h4 className='fw-bolder mb-0 text-dark'>WhatsApp Cloud API Integration</h4>
                                    <Badge color='light-success' pill>
                                        Official Meta Provider
                                    </Badge>
                                </div>
                                <p className='text-muted mb-0 small'>
                                    Connect your WhatsApp Business Account (WABA) and phone numbers via Meta 1-Click Embedded Signup or direct Cloud API keys.
                                </p>
                            </div>
                        </div>

                        <div className='d-flex align-items-center gap-2'>
                            <Button
                                color={helpOpen ? 'secondary' : 'light-primary'}
                                size='sm'
                                className='d-flex align-items-center gap-1'
                                onClick={() => setHelpOpen(!helpOpen)}
                            >
                                <HelpCircle size={15} />
                                <span>{helpOpen ? 'Hide Setup Guide' : 'Setup Guide & Prerequisites'}</span>
                            </Button>
                        </div>
                    </div>

                    {helpOpen && (
                        <div className='mt-3 pt-3 border-top'>
                            <h6 className='fw-bolder text-dark mb-2'>Quick Setup Instructions:</h6>
                            <Row className='g-2'>
                                <Col md='4' sm='12'>
                                    <div className='p-2 border rounded bg-light-secondary h-100'>
                                        <div className='fw-bold text-dark d-flex align-items-center gap-1'>
                                            <span className='badge bg-primary rounded-circle me-1'>1</span>
                                            Meta Developer Account
                                        </div>
                                        <small className='text-muted d-block mt-1'>
                                            Create a Meta app at <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className='fw-bold'>developers.facebook.com</a> with <strong>WhatsApp</strong> product enabled.
                                        </small>
                                    </div>
                                </Col>
                                <Col md='4' sm='12'>
                                    <div className='p-2 border rounded bg-light-secondary h-100'>
                                        <div className='fw-bold text-dark d-flex align-items-center gap-1'>
                                            <span className='badge bg-primary rounded-circle me-1'>2</span>
                                            WABA & Phone Number
                                        </div>
                                        <small className='text-muted d-block mt-1'>
                                            Add or verify your WhatsApp business phone number. Retrieve your <strong>WABA ID</strong> and <strong>Phone Number ID</strong> from API Setup.
                                        </small>
                                    </div>
                                </Col>
                                <Col md='4' sm='12'>
                                    <div className='p-2 border rounded bg-light-secondary h-100'>
                                        <div className='fw-bold text-dark d-flex align-items-center gap-1'>
                                            <span className='badge bg-primary rounded-circle me-1'>3</span>
                                            Embed or Enter Keys
                                        </div>
                                        <small className='text-muted d-block mt-1'>
                                            Use the <strong>1-Click Embedded Signup</strong> below for automatic onboarding, or manually enter your permanent System User Access Token.
                                        </small>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Main WhatsApp Connections & Embedded Signup View */}
            <Connections />
        </div>
    )
}
