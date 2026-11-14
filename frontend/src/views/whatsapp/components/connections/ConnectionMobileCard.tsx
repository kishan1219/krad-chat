import React from 'react'
import { Card, CardBody, Badge, Button } from 'reactstrap'
import {
    Smartphone,
    RefreshCw,
    Trash2,
    LogIn,
    LogOut,
    CheckCircle,
    AlertCircle
} from 'react-feather'
import { WhatsAppConnection } from '../../../../services/whatsappService'

interface ConnectionMobileCardProps {
    conn: WhatsAppConnection
    isBusy: boolean
    onSync: (id: number) => void
    onToggleStatus: (conn: WhatsAppConnection) => void
    onDelete: (id: number) => void
    onOpenCoExistence: (conn: WhatsAppConnection) => void
    onOpenForecast?: (conn: WhatsAppConnection) => void
    onOpenTierUpgrade?: (conn: WhatsAppConnection) => void
    onOpenIncrementalSync?: (conn: WhatsAppConnection) => void
}

export const ConnectionMobileCard: React.FC<ConnectionMobileCardProps> = ({
    conn,
    isBusy,
    onSync,
    onToggleStatus,
    onDelete,
    onOpenCoExistence,
    onOpenForecast,
    onOpenTierUpgrade,
    onOpenIncrementalSync
}) => {
    const isConnected = conn.status === 'connected' || conn.status === 'verified'
    const quality = (conn.quality_rating || 'GREEN').toUpperCase()

    return (
        <Card className="border shadow-none rounded-3 mb-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
            <CardBody className="p-3">
                {/* Header: Name, Status & Primary Icon */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '38px',
                                height: '38px',
                                backgroundColor: '#ecfdf5',
                                color: '#059669',
                                flexShrink: 0
                            }}
                        >
                            <Smartphone size={18} />
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-1 flex-wrap">
                                <span className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>
                                    {conn.name || 'WhatsApp Line'}
                                </span>
                                {conn.name_status === 'APPROVED' || conn.name_status === 'AVAILABLE_WITHOUT_REVIEW' ? (
                                    <Badge color="light-success" pill style={{ fontSize: '0.65rem' }}>
                                        ✓ Approved
                                    </Badge>
                                ) : conn.name_status === 'PENDING_REVIEW' ? (
                                    <Badge color="light-warning" pill style={{ fontSize: '0.65rem' }}>
                                        ⟳ In Review
                                    </Badge>
                                ) : conn.name_status === 'DECLINED' || conn.name_status === 'REJECTED' ? (
                                    <Badge color="light-danger" pill style={{ fontSize: '0.65rem' }}>
                                        ✕ Action Needed
                                    </Badge>
                                ) : null}
                            </div>
                            <div className="text-muted font-monospace fw-semibold" style={{ fontSize: '0.8rem' }}>
                                {conn.display_phone_number || 'No number'}
                            </div>
                        </div>
                    </div>

                    <Badge
                        color={isConnected ? 'light-success' : 'light-secondary'}
                        pill
                        className="d-inline-flex align-items-center gap-1 py-1 px-2"
                        style={{ fontSize: '0.72rem' }}
                    >
                        {isConnected ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                        <span className="text-capitalize">{conn.status}</span>
                    </Badge>
                </div>

                {/* Quality & Limit Tier Badges */}
                <div className="d-flex align-items-center gap-2 py-2 border-top border-bottom mb-2">
                    <Badge
                        color={quality === 'GREEN' ? 'light-success' : quality === 'YELLOW' ? 'light-warning' : 'light-danger'}
                        pill
                        className="py-1 px-2"
                        style={{ fontSize: '0.72rem' }}
                    >
                        {quality} Quality
                    </Badge>

                    <Badge color="light-primary" pill className="py-1 px-2" style={{ fontSize: '0.72rem' }}>
                        {conn.messaging_limit_tier || 'TIER_1K'}
                    </Badge>
                </div>

                {/* Meta Identifiers */}
                <div className="p-2 rounded-2 bg-light font-monospace mb-2" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    <div><span className="text-muted">Phone ID:</span> {conn.phone_number_id}</div>
                    <div><span className="text-muted">WABA ID:</span> {conn.waba_id || 'N/A'}</div>
                </div>

                {/* Secondary Action Buttons */}
                <div className="d-flex flex-wrap gap-1 mb-2">
                    {onOpenForecast && (
                        <Button
                            type="button"
                            size="sm"
                            color="light"
                            onClick={() => onOpenForecast(conn)}
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', flex: '1 1 auto' }}
                        >
                            Health Forecast
                        </Button>
                    )}
                    {onOpenTierUpgrade && (
                        <Button
                            type="button"
                            size="sm"
                            color="light"
                            onClick={() => onOpenTierUpgrade(conn)}
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', flex: '1 1 auto' }}
                        >
                            Tier Upgrade
                        </Button>
                    )}
                    <Button
                        type="button"
                        size="sm"
                        color="light"
                        onClick={() => onOpenCoExistence(conn)}
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', flex: '1 1 auto' }}
                    >
                        Migrate App
                    </Button>
                    {onOpenIncrementalSync && (
                        <Button
                            type="button"
                            size="sm"
                            color="light"
                            onClick={() => onOpenIncrementalSync(conn)}
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', flex: '1 1 auto' }}
                        >
                            Sync Chats
                        </Button>
                    )}
                </div>

                {/* Footer Control Strip */}
                <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                    <Button
                        type="button"
                        size="sm"
                        color="light"
                        onClick={() => onSync(conn.id)}
                        disabled={isBusy}
                        className="d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.75rem' }}
                    >
                        <RefreshCw size={12} className={isBusy ? 'animate-spin' : ''} />
                        <span>Sync Meta</span>
                    </Button>

                    <div className="d-flex align-items-center gap-1">
                        <Button
                            type="button"
                            size="sm"
                            color={isConnected ? 'light' : 'success'}
                            onClick={() => onToggleStatus(conn)}
                            disabled={isBusy}
                            style={{ padding: '0.3rem 0.5rem' }}
                        >
                            {isConnected ? <LogOut size={13} /> : <LogIn size={13} />}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            color="light"
                            onClick={() => onDelete(conn.id)}
                            disabled={isBusy}
                            style={{ padding: '0.3rem 0.5rem', color: '#ea5455' }}
                        >
                            <Trash2 size={13} />
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

export default ConnectionMobileCard
