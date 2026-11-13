import React from 'react'
import { AlertTriangle, X, ExternalLink } from 'react-feather'
import { Alert, Badge, Button } from 'reactstrap'

interface DegradationAlert {
    phoneNumber: string
    previousQuality: string
    newQuality: string
    reason?: string
}

interface QualityDegradationBannerProps {
    alerts: DegradationAlert[]
    onDismiss: () => void
}

export function QualityDegradationBanner({ alerts, onDismiss }: QualityDegradationBannerProps) {
    if (!alerts || alerts.length === 0) return null

    return (
        <Alert
            color="warning"
            className="mb-2 p-1 position-relative shadow-sm"
            style={{ borderRadius: '8px', border: '1px solid #ff9f43', backgroundColor: '#fff9e6' }}
        >
            <div className="d-flex align-items-start justify-content-between">
                <div className="d-flex align-items-start gap-1">
                    <div className="p-50 rounded" style={{ backgroundColor: '#ffebd8', color: '#ff9f43' }}>
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-1 mb-25">
                            <span className="fw-bolder" style={{ color: '#5e5873', fontSize: '0.92rem' }}>
                                Phone Number Quality Rating Degraded
                            </span>
                            <Badge color="warning" pill>
                                Meta Alert
                            </Badge>
                        </div>
                        <p className="small text-muted mb-50" style={{ maxWidth: '640px' }}>
                            Meta detected elevated customer block/report rates. Your messaging limit tier may be throttled
                            if quality is not restored within 7 days.
                        </p>
                        <div className="d-flex flex-wrap gap-1 mb-50">
                            {alerts.map((alert, idx) => (
                                <Badge
                                    key={idx}
                                    color={alert.newQuality === 'RED' ? 'light-danger' : 'light-warning'}
                                    className="p-50 font-monospace"
                                >
                                    {alert.phoneNumber} → {alert.newQuality} Quality
                                </Badge>
                            ))}
                        </div>
                        <div className="small text-muted d-flex flex-wrap align-items-center gap-1">
                            <span className="fw-bold">Recommended:</span>
                            <span>• Pause non-critical broadcasts</span>
                            <span>• Ensure opt-in compliance</span>
                            <a
                                href="https://business.facebook.com/wa/manage/phone-numbers/"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#ff8c21', fontWeight: 600 }}
                                className="d-inline-flex align-items-center gap-25 ms-50"
                            >
                                Open Meta Manager <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </div>

                <Button
                    color="link"
                    size="sm"
                    className="p-25 text-muted"
                    onClick={onDismiss}
                >
                    <X size={18} />
                </Button>
            </div>
        </Alert>
    )
}
