import React, { useState } from 'react'
import { Button } from 'reactstrap'
import { Smartphone, Activity, GitBranch } from 'react-feather'
import { useWhatsAppConnections } from './hooks/useWhatsAppConnections'
import { ConnectionsHeader } from './components/connections/ConnectionsHeader'
import { ConnectionsMetrics } from './components/connections/ConnectionsMetrics'
import { QualityDegradationBanner } from './components/connections/QualityDegradationBanner'
import { SafeguardBanner } from './components/connections/SafeguardBanner'
import { ManualCredentialsCard } from './components/connections/ManualCredentialsCard'
import { ConnectionsTable } from './components/connections/ConnectionsTable'
import { CoExistenceMigrationModal } from './components/connections/CoExistenceMigrationModal'
import { IncrementalSyncModal } from './components/connections/IncrementalSyncModal'
import { QualityForecastModal } from './components/connections/QualityForecastModal'
import { InboundRouterModal } from './components/connections/InboundRouterModal'
import { MultiWabaDashboard } from './components/connections/MultiWabaDashboard'
import { TierUpgradeCountdownModal } from './components/TierUpgradeCountdownModal'
import AddWhatsappConfigModal from './AddWhatsappConfigModal'
import { WhatsAppConnection } from '../../services/whatsappService'

export default function Connections() {
    const {
        connections,
        loading,
        actionBusyId,
        degradationAlerts,
        dismissAlerts,
        fetchConnections,
        handleSync,
        handleToggleStatus,
        handleDelete
    } = useWhatsAppConnections()

    const [viewMode, setViewMode] = useState<'lines' | 'analytics'>('lines')
    const [search, setSearch] = useState('')
    const [showManual, setShowManual] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showRouterModal, setShowRouterModal] = useState(false)
    const [coExistenceConn, setCoExistenceConn] = useState<WhatsAppConnection | null>(null)
    const [incSyncConn, setIncSyncConn] = useState<WhatsAppConnection | null>(null)
    const [forecastConn, setForecastConn] = useState<WhatsAppConnection | null>(null)
    const [tierUpgradeConn, setTierUpgradeConn] = useState<WhatsAppConnection | null>(null)

    return (
        <div className="container-fluid px-2 px-sm-3 py-2">
            {/* Header with Title, Action buttons, and Search */}
            <ConnectionsHeader
                search={search}
                onSearchChange={setSearch}
                onOpenAddModal={() => setShowAddModal(true)}
                showManual={showManual}
                onToggleManual={() => setShowManual(!showManual)}
                onRefresh={fetchConnections}
                refreshing={loading}
            />

            {/* View Mode Navigation Tabs */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom pb-2 mb-3">
                <div className="d-flex align-items-center gap-1 flex-wrap">
                    <Button
                        type="button"
                        onClick={() => setViewMode('lines')}
                        size="sm"
                        style={{
                            backgroundColor: viewMode === 'lines' ? '#ff8c21' : '#f8f9fa',
                            borderColor: viewMode === 'lines' ? '#ff8c21' : '#e2e8f0',
                            color: viewMode === 'lines' ? '#ffffff' : '#4b5563',
                            fontWeight: 600,
                            borderRadius: '6px',
                            padding: '0.45rem 1rem'
                        }}
                        className="d-inline-flex align-items-center gap-1 shadow-sm"
                    >
                        <Smartphone size={15} />
                        <span>Phone Numbers & Lines ({connections.length})</span>
                    </Button>
                    <Button
                        type="button"
                        onClick={() => setViewMode('analytics')}
                        size="sm"
                        style={{
                            backgroundColor: viewMode === 'analytics' ? '#ff8c21' : '#f8f9fa',
                            borderColor: viewMode === 'analytics' ? '#ff8c21' : '#e2e8f0',
                            color: viewMode === 'analytics' ? '#ffffff' : '#4b5563',
                            fontWeight: 600,
                            borderRadius: '6px',
                            padding: '0.45rem 1rem'
                        }}
                        className="d-inline-flex align-items-center gap-1 shadow-sm"
                    >
                        <Activity size={15} />
                        <span>Enterprise Multi-WABA Analytics</span>
                    </Button>
                </div>

                <Button
                    type="button"
                    color="light"
                    size="sm"
                    onClick={() => setShowRouterModal(true)}
                    style={{
                        borderColor: '#e2e8f0',
                        color: '#334155',
                        fontWeight: 600,
                        borderRadius: '6px',
                        padding: '0.45rem 1rem',
                        backgroundColor: '#ffffff'
                    }}
                    className="d-inline-flex align-items-center gap-1 shadow-sm"
                >
                    <GitBranch size={15} style={{ color: '#ff8c21' }} />
                    <span>Inbound Routing Rules</span>
                </Button>
            </div>

            {/* Automated WhatsApp Disconnect Safeguard Banner (Auto-pause at 5% Block Rate) */}
            <SafeguardBanner onStatusChange={fetchConnections} />

            {/* Quality Degradation Alert Banner (Real-time Meta Alerts) */}
            <QualityDegradationBanner
                alerts={degradationAlerts}
                onDismiss={dismissAlerts}
            />

            {viewMode === 'analytics' ? (
                <MultiWabaDashboard onSwitchToLines={() => setViewMode('lines')} />
            ) : (
                <>
                    {/* Aggregated Connection Metrics */}
                    <ConnectionsMetrics connections={connections} />

                    {/* Manual Meta API Credentials Card (Collapsible) */}
                    {showManual && (
                        <ManualCredentialsCard
                            onSuccess={fetchConnections}
                            onClose={() => setShowManual(false)}
                        />
                    )}

                    {/* Table of Connected Lines */}
                    <ConnectionsTable
                        connections={connections}
                        search={search}
                        actionBusyId={actionBusyId}
                        onSync={handleSync}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete}
                        onOpenCoExistence={(conn) => setCoExistenceConn(conn)}
                        onOpenForecast={(conn) => setForecastConn(conn)}
                        onOpenTierUpgrade={(conn) => setTierUpgradeConn(conn)}
                        onOpenIncrementalSync={(conn) => setIncSyncConn(conn)}
                        onOpenAddModal={() => setShowAddModal(true)}
                    />
                </>
            )}

            {/* Embedded Signup Modal (Multi-step Wizard) */}
            <AddWhatsappConfigModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchConnections}
            />

            {/* Embedded Co-Existence Migration Modal */}
            <CoExistenceMigrationModal
                connection={coExistenceConn}
                isOpen={!!coExistenceConn}
                onClose={() => setCoExistenceConn(null)}
                onSuccess={fetchConnections}
            />

            {/* Co-Existence Incremental Sync & Polling Modal */}
            <IncrementalSyncModal
                connection={incSyncConn}
                isOpen={!!incSyncConn}
                onClose={() => setIncSyncConn(null)}
                onSuccess={fetchConnections}
            />

            {/* Proactive Quality Health Forecast Modal */}
            <QualityForecastModal
                connection={forecastConn}
                isOpen={!!forecastConn}
                onClose={() => setForecastConn(null)}
            />

            {/* Predictive Tier Upgrade Countdown Modal */}
            <TierUpgradeCountdownModal
                connection={tierUpgradeConn}
                isOpen={!!tierUpgradeConn}
                onClose={() => setTierUpgradeConn(null)}
            />

            {/* Multi-WABA Inbound Router Modal */}
            <InboundRouterModal
                connections={connections}
                isOpen={showRouterModal}
                onClose={() => setShowRouterModal(false)}
            />
        </div>
    )
}
