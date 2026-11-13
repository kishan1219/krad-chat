import React from 'react'
import { Badge } from 'reactstrap'
import { Check, Video, Phone, MoreVertical, Send } from 'react-feather'

interface PhoneMockupProps {
    name: string
    enableAutoResponse: boolean
    autoResponseMessage: string
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
    name,
    enableAutoResponse,
    autoResponseMessage
}) => {
    return (
        <div className='text-center'>
            <div
                className='mx-auto shadow-lg text-start'
                style={{
                    maxWidth: '260px',
                    borderRadius: '34px',
                    border: '8px solid #1e293b',
                    backgroundColor: '#111827',
                    overflow: 'hidden'
                }}
            >
                {/* Speaker & camera notch */}
                <div className='d-flex justify-content-center align-items-center py-1 bg-dark'>
                    <div style={{ width: 44, height: 4, backgroundColor: '#374151', borderRadius: 4 }} />
                    <div className='ms-1 rounded-circle' style={{ width: 6, height: 6, backgroundColor: '#1f2937' }} />
                </div>

                {/* WhatsApp Top Bar */}
                <div
                    className='p-2 text-white d-flex align-items-center justify-content-between'
                    style={{ backgroundColor: '#075E54' }}
                >
                    <div className='d-flex align-items-center gap-1 overflow-hidden'>
                        <div
                            className='rounded-circle bg-white text-dark d-flex align-items-center justify-content-center flex-shrink-0'
                            style={{ width: 26, height: 26, fontWeight: 'bold', fontSize: '11px', color: '#075E54' }}
                        >
                            {(name || 'Brand').charAt(0).toUpperCase()}
                        </div>
                        <div className='overflow-hidden text-truncate'>
                            <div className='d-flex align-items-center gap-50'>
                                <span className='fw-bold small text-truncate text-white' style={{ fontSize: '0.75rem' }}>
                                    {name || 'Your Brand'}
                                </span>
                                <span
                                    className='badge bg-success rounded-circle p-0 d-inline-flex align-items-center justify-content-center'
                                    style={{ width: 12, height: 12 }}
                                >
                                    ✓
                                </span>
                            </div>
                            <div style={{ fontSize: '0.62rem', color: '#bbf7d0', lineHeight: 1 }}>Active Now</div>
                        </div>
                    </div>
                    <div className='d-flex align-items-center gap-1 text-white opacity-75' style={{ fontSize: '12px' }}>
                        <Video size={13} />
                        <Phone size={12} />
                        <MoreVertical size={13} />
                    </div>
                </div>

                {/* WhatsApp Chat Canvas */}
                <div
                    className='p-2'
                    style={{
                        backgroundColor: '#efeae2',
                        minHeight: '230px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                >
                    <div>
                        <div className='text-center my-1'>
                            <span
                                className='px-2 py-50 rounded shadow-2xs text-muted'
                                style={{ backgroundColor: '#ffffff', fontSize: '0.58rem' }}
                            >
                                TODAY
                            </span>
                        </div>

                        {/* Incoming client bubble */}
                        <div
                            className='p-2 rounded-2xl bg-white shadow-xs mb-1 text-dark'
                            style={{
                                maxWidth: '85%',
                                fontSize: '0.68rem',
                                borderTopLeftRadius: '2px',
                                lineHeight: 1.3
                            }}
                        >
                            Hello! Could I get more information about your official services?
                            <div className='text-muted text-end' style={{ fontSize: '0.55rem', marginTop: '2px' }}>
                                10:30 AM
                            </div>
                        </div>

                        {/* Business response bubble */}
                        <div
                            className='p-2 rounded-2xl shadow-xs ms-auto mb-1 text-dark'
                            style={{
                                maxWidth: '88%',
                                backgroundColor: '#dcf8c6',
                                fontSize: '0.68rem',
                                borderTopRightRadius: '2px',
                                lineHeight: 1.3
                            }}
                        >
                            {enableAutoResponse
                                ? autoResponseMessage
                                : `Welcome to ${name || 'our official business line'}! We are ready to assist you.`}
                            <div
                                className='text-muted text-end d-flex align-items-center justify-content-end gap-50'
                                style={{ fontSize: '0.55rem', marginTop: '2px' }}
                            >
                                <span>10:30 AM</span>
                                <span style={{ color: '#34B7F1', fontWeight: 'bold' }}>✓✓</span>
                            </div>
                        </div>
                    </div>

                    {/* Chat input simulation */}
                    <div
                        className='d-flex align-items-center gap-1 px-2 py-1 bg-white rounded-pill shadow-xs'
                        style={{ fontSize: '0.65rem' }}
                    >
                        <span className='text-muted'>🙂</span>
                        <span className='text-muted flex-fill'>Type a message</span>
                        <span className='text-muted'>📎</span>
                        <div
                            className='rounded-circle d-flex align-items-center justify-content-center text-white'
                            style={{ width: 18, height: 18, backgroundColor: '#00b074' }}
                        >
                            <Send size={9} />
                        </div>
                    </div>
                </div>
            </div>

            <Badge color='light-success' pill className='mt-2 px-2 py-50'>
                <Check size={12} className='me-50 text-success' />
                <span>Verified Cloud API</span>
            </Badge>
        </div>
    )
}
