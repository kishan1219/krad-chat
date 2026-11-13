import React, { useEffect, useState } from 'react'
import { AlertOctagon, RefreshCw, CheckCircle } from 'react-feather'
import { Alert, Button } from 'reactstrap'
import { whatsappService, SafeguardStatusResult } from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface SafeguardBannerProps {
    onStatusChange?: () => void
}

export function SafeguardBanner({ onStatusChange }: SafeguardBannerProps) {
    const [status, setStatus] = useState<SafeguardStatusResult | null>(null)
    const [overriding, setOverriding] = useState(false)

    const fetchStatus = async () => {
        try {
            const res = await whatsappService.getSafeguardStatus()
            setStatus(res)
        } catch {
            // Ignore background check failure
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    const handleOverride = async () => {
        setOverriding(true)
        try {
            const res = await whatsappService.overrideSafeguard()
            SuccessToast(res.message || 'Safeguard overridden. Broadcasting resumed.')
            await fetchStatus()
            onStatusChange?.()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to override safeguard'
            ErrorToast(msg)
        } finally {
            setOverriding(false)
        }
    }

    if (!status?.safeguard_active && !status?.broadcasts_paused) return null

    return (
        <Alert
            color="danger"
            className="mb-2 p-1 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-1 shadow-sm"
            style={{ borderRadius: '8px', border: '1px solid #ea5455' }}
        >
            <div className="d-flex align-items-start gap-1">
                <div className="p-50 rounded" style={{ backgroundColor: '#ffebee', color: '#ea5455' }}>
                    <AlertOctagon size={20} />
                </div>
                <div>
                    <h6 className="fw-bolder mb-25 text-uppercase" style={{ color: '#ea5455', fontSize: '0.85rem' }}>
                        Automated WhatsApp Disconnect Safeguard Active
                    </h6>
                    <div className="small text-muted" style={{ fontSize: '0.82rem' }}>
                        Bulk broadcasting is automatically halted. 24h block rate reached{' '}
                        <strong className="text-danger">{status.block_rate}%</strong>{' '}
                        (Critical Threshold: {status.threshold}%). {status.paused_campaigns_count} active campaign(s) paused to prevent Meta restrictions.
                    </div>
                </div>
            </div>

            <div className="ms-md-auto">
                <Button
                    size="sm"
                    color="danger"
                    disabled={overriding}
                    onClick={handleOverride}
                    className="d-inline-flex align-items-center gap-50 fw-bold"
                >
                    {overriding ? (
                        <RefreshCw size={14} className="animate-spin" />
                    ) : (
                        <CheckCircle size={14} />
                    )}
                    <span>Override & Resume Broadcasting</span>
                </Button>
            </div>
        </Alert>
    )
}
