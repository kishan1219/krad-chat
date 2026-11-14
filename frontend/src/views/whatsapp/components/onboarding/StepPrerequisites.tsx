import React from 'react'
import { Button } from 'reactstrap'

interface StepPrerequisitesProps {
    onNext: () => void
    onClose: () => void
}

export const StepPrerequisites: React.FC<StepPrerequisitesProps> = ({ onNext, onClose }) => {
    return (
        <div className="py-1">
            <div className="mb-2">
                <h3
                    className="fw-bolder mb-1"
                    style={{ color: '#5e5873', fontSize: '1.4rem', letterSpacing: '-0.2px' }}
                >
                    Get started with WhatsApp’s Business API
                </h3>
                <p className="text-muted" style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                    WhatsApp is one of the most popular communication applications in the world.
                    WhatsApp is a Facebook company and requires a Facebook account and Facebook
                    Business Manager to set up.
                </p>
            </div>

            <div className="mb-2">
                <h5 className="fw-bolder mb-1" style={{ color: '#22292f', fontSize: '1rem' }}>
                    What you will Need :-
                </h5>
                <ol
                    style={{
                        paddingLeft: '1.25rem',
                        color: '#6e6b7b',
                        fontSize: '0.88rem',
                        lineHeight: 1.85
                    }}
                >
                    <li>Access to Facebook Business Manager</li>
                    <li>A viable Phone Number for WhatsApp</li>
                    <li>Your business’s legal address and details</li>
                    <li>Verify your Facebook Business</li>
                    <li>Please ensure you have full access to the WhatsApp Business account</li>
                    <li>Please ensure the ID that is being used belongs to the business that you manage</li>
                    <li>
                        Please ensure the FB user ID has access to manage the WhatsApp account templates,
                        phone numbers, generate QR code
                    </li>
                </ol>
            </div>

            <div className="mb-2">
                <h5 className="fw-bolder mb-1" style={{ color: '#22292f', fontSize: '1rem' }}>
                    Create your WhatsApp Business Account
                </h5>
                <p className="text-muted mb-1" style={{ fontSize: '0.88rem' }}>
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
            </div>

            <div className="d-flex flex-column-reverse flex-sm-row justify-content-end align-items-stretch align-items-sm-center gap-2 pt-2 border-top mt-3">
                <Button
                    color="secondary"
                    outline
                    type="button"
                    onClick={onClose}
                    className="w-100 w-sm-auto"
                    style={{
                        borderRadius: '6px',
                        padding: '0.6rem 1.75rem',
                        fontWeight: 500,
                        borderColor: '#b9b9c3',
                        color: '#6e6b7b'
                    }}
                >
                    Close
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    className="w-100 w-sm-auto"
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
                    Next
                </Button>
            </div>
        </div>
    )
}
