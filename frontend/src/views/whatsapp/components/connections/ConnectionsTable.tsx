import React from 'react'
import { Card, CardBody, Table, Button, Badge } from 'reactstrap'
import {
    RefreshCw,
    Trash2,
    Smartphone,
    LogOut,
    LogIn,
    CheckCircle,
    AlertCircle,
    Shield,
    Zap,
    Plus
} from 'react-feather'
import { WhatsAppConnection } from '../../../../services/whatsappService'
import { ConnectionMobileCard } from './ConnectionMobileCard'

interface ConnectionsTableProps {
    connections: WhatsAppConnection[]
    search: string
    actionBusyId: number | null
    onSync: (id: number) => void
    onToggleStatus: (conn: WhatsAppConnection) => void
    onDelete: (id: number) => void
    onOpenCoExistence: (conn: WhatsAppConnection) => void
    onOpenForecast?: (conn: WhatsAppConnection) => void
    onOpenTierUpgrade?: (conn: WhatsAppConnection) => void
    onOpenIncrementalSync?: (conn: WhatsAppConnection) => void
    onOpenOba?: (conn: WhatsAppConnection) => void
    onOpenReReview?: (conn: WhatsAppConnection) => void
    onSyncTemplates?: (id: number) => void
    onOpenAddModal: () => void
}

export function ConnectionsTable({
    connections,
    search,
    actionBusyId,
    onSync,
    onToggleStatus,
    onDelete,
    onOpenCoExistence,
    onOpenForecast,
    onOpenTierUpgrade,
    onOpenIncrementalSync,
    onOpenOba,
    onOpenReReview,
    onSyncTemplates,
    onOpenAddModal
}: ConnectionsTableProps) {
    const filtered = connections.filter(c => {
        const query = search.toLowerCase()
        return (
            (c.name && c.name.toLowerCase().includes(query)) ||
            (c.display_phone_number && c.display_phone_number.toLowerCase().includes(query)) ||
            (c.phone_number_id && c.phone_number_id.toLowerCase().includes(query)) ||
            (c.waba_id && c.waba_id.toLowerCase().includes(query))
        )
    })

    if (filtered.length === 0) {
        return (
            <Card className="border shadow-none rounded-3 text-center p-4 p-sm-5 mb-3" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                <CardBody className="d-flex flex-column align-items-center">
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm"
                        style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: '#fff7ed',
                            color: '#ff8c21'
                        }}
                    >
                        <Smartphone size={26} />
                    </div>
                    <h4 className="fw-bolder mb-1 text-dark" style={{ fontSize: '1.2rem' }}>
                        {search ? 'No Matching Phone Numbers Found' : 'No WhatsApp Connections Yet'}
                    </h4>
                    <p className="text-muted mb-3" style={{ fontSize: '0.88rem', maxWidth: '440px' }}>
                        {search
                            ? 'Try refining your search keyword by name, phone number, or WABA ID.'
                            : 'Connect your Meta WhatsApp Business line using Meta Embedded Signup (2 minutes) or direct System User Token.'}
                    </p>

                    {!search && (
                        <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-4">
                            <Button
                                type="button"
                                onClick={onOpenAddModal}
                                style={{
                                    backgroundColor: '#ff8c21',
                                    borderColor: '#ff8c21',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    padding: '0.6rem 1.75rem',
                                    fontSize: '0.9rem'
                                }}
                                className="d-inline-flex align-items-center gap-1 shadow-sm"
                            >
                                <Plus size={16} />
                                <span>Connect First WhatsApp Line</span>
                            </Button>
                        </div>
                    )}

                    <div className="d-flex flex-wrap justify-content-center gap-3 text-muted pt-3 border-top w-100" style={{ fontSize: '0.8rem' }}>
                        <span className="d-inline-flex align-items-center gap-1">
                            <Shield size={14} className="text-success" /> Direct Meta Cloud API v22.0
                        </span>
                        <span className="d-inline-flex align-items-center gap-1">
                            <Zap size={14} className="text-primary" /> Instant Webhook Sync
                        </span>
                        <span className="d-inline-flex align-items-center gap-1">
                            <CheckCircle size={14} className="text-warning" /> Automatic Name Approval Polling
                        </span>
                    </div>
                </CardBody>
            </Card>
        )
    }

    return (
        <div className="mb-3">
            {/* Mobile Cards View (Visible on screens < 768px) */}
            <div className="d-block d-md-none">
                {filtered.map(conn => (
                    <ConnectionMobileCard
                        key={conn.id}
                        conn={conn}
                        isBusy={actionBusyId === conn.id}
                        onSync={onSync}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDelete}
                        onOpenCoExistence={onOpenCoExistence}
                        onOpenForecast={onOpenForecast}
                        onOpenTierUpgrade={onOpenTierUpgrade}
                        onOpenIncrementalSync={onOpenIncrementalSync}
                        onOpenOba={onOpenOba}
                        onOpenReReview={onOpenReReview}
                        onSyncTemplates={onSyncTemplates}
                    />
                ))}
            </div>

            {/* Desktop Table View (Visible on screens >= 768px) */}
            <div className="d-none d-md-block card border shadow-none rounded-3 overflow-hidden mb-3" style={{ borderColor: '#e2e8f0' }}>
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                                <th className="py-2 px-3">Line & Display Name</th>
                                <th className="py-2 px-3">Meta Identifiers</th>
                                <th className="py-2 px-3">Status</th>
                                <th className="py-2 px-3">Quality Rating</th>
                                <th className="py-2 px-3">Daily Limit Tier</th>
                                <th className="py-2 px-3 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((conn) => {
                                const isBusy = actionBusyId === conn.id
                                const isConnected = conn.status === 'connected' || conn.status === 'verified'
                                const quality = (conn.quality_rating || 'GREEN').toUpperCase()

                                return (
                                    <tr key={conn.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td className="py-3 px-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        backgroundColor: '#ecfdf5',
                                                        color: '#059669',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <Smartphone size={18} />
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <span className="fw-bold text-dark">{conn.name || 'WhatsApp Line'}</span>
                                                        {conn.name_status === 'APPROVED' || conn.name_status === 'AVAILABLE_WITHOUT_REVIEW' ? (
                                                            <Badge color="light-success" pill style={{ fontSize: '0.68rem' }}>
                                                                ✓ Approved
                                                            </Badge>
                                                        ) : conn.name_status === 'PENDING_REVIEW' ? (
                                                            <Badge
                                                                color="light-warning"
                                                                pill
                                                                style={{ fontSize: '0.68rem', cursor: onOpenReReview ? 'pointer' : 'default' }}
                                                                onClick={() => onOpenReReview?.(conn)}
                                                                title="Meta Review in progress - Click to view or resubmit"
                                                            >
                                                                ⟳ In Review
                                                            </Badge>
                                                        ) : conn.name_status === 'DECLINED' || conn.name_status === 'REJECTED' ? (
                                                            <Badge
                                                                color="light-danger"
                                                                pill
                                                                style={{ fontSize: '0.68rem', cursor: onOpenReReview ? 'pointer' : 'default' }}
                                                                onClick={() => onOpenReReview?.(conn)}
                                                                title="Meta declined display name - Click to resubmit"
                                                            >
                                                                ✕ Action Needed (Re-Review)
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                    <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>
                                                        {conn.display_phone_number || 'No phone number'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3 px-3 font-monospace" style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                            <div><span className="text-muted">WABA:</span> {conn.waba_id || 'N/A'}</div>
                                            <div><span className="text-muted">Phone ID:</span> {conn.phone_number_id}</div>
                                        </td>

                                        <td className="py-3 px-3">
                                            <Badge
                                                color={isConnected ? 'light-success' : 'light-secondary'}
                                                pill
                                                className="d-inline-flex align-items-center gap-1 py-1 px-2"
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                {isConnected ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                <span className="text-capitalize">{conn.status}</span>
                                            </Badge>
                                        </td>

                                        <td className="py-3 px-3">
                                            <Badge
                                                color={quality === 'GREEN' ? 'light-success' : quality === 'YELLOW' ? 'light-warning' : 'light-danger'}
                                                pill
                                                className="py-1 px-2"
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                {quality} Quality
                                            </Badge>
                                        </td>

                                        <td className="py-3 px-3">
                                            <Badge color="light-primary" pill className="py-1 px-2" style={{ fontSize: '0.75rem' }}>
                                                {conn.messaging_limit_tier || 'TIER_1K'}
                                            </Badge>
                                        </td>

                                        <td className="py-3 px-3 text-end">
                                            <div className="d-flex align-items-center justify-content-end gap-1">
                                                {onOpenOba && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        color="light"
                                                        onClick={() => onOpenOba(conn)}
                                                        title="Official Business Account (OBA Green Checkmark) Status Tracker"
                                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#059669', borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }}
                                                    >
                                                        ✓ OBA
                                                    </Button>
                                                )}
                                                {onOpenForecast && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        color="light"
                                                        onClick={() => onOpenForecast(conn)}
                                                        title="Proactive Quality Health Forecast"
                                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                                                    >
                                                        Forecast
                                                    </Button>
                                                )}
                                                {onOpenTierUpgrade && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        color="light"
                                                        onClick={() => onOpenTierUpgrade(conn)}
                                                        title="Predictive Tier Upgrade Countdown"
                                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                                                    >
                                                        Tier
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    color="light"
                                                    onClick={() => onOpenCoExistence(conn)}
                                                    title="Migrate WhatsApp Business Mobile App (Co-Existence)"
                                                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                                                >
                                                    Migrate
                                                </Button>
                                                {onOpenIncrementalSync && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        color="light"
                                                        onClick={() => onOpenIncrementalSync(conn)}
                                                        title="Sync Chats"
                                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                                                    >
                                                        Sync
                                                    </Button>
                                                )}
                                                {onSyncTemplates && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        color="light"
                                                        onClick={() => onSyncTemplates(conn.id)}
                                                        disabled={isBusy}
                                                        title="Sync WhatsApp Templates with Meta WABA"
                                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                                                    >
                                                        Templates
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    color="light"
                                                    onClick={() => onSync(conn.id)}
                                                    disabled={isBusy}
                                                    title="Sync Quality & Limit with Meta"
                                                    style={{ padding: '0.35rem 0.5rem' }}
                                                >
                                                    <RefreshCw size={14} className={isBusy ? 'animate-spin' : ''} />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    color={isConnected ? 'light' : 'success'}
                                                    onClick={() => onToggleStatus(conn)}
                                                    disabled={isBusy}
                                                    title={isConnected ? 'Disconnect Line' : 'Reconnect Line'}
                                                    style={{ padding: '0.35rem 0.5rem' }}
                                                >
                                                    {isConnected ? <LogOut size={14} /> : <LogIn size={14} />}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    color="light"
                                                    onClick={() => onDelete(conn.id)}
                                                    disabled={isBusy}
                                                    title="Delete Connection"
                                                    style={{ padding: '0.35rem 0.5rem', color: '#ea5455' }}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default ConnectionsTable
