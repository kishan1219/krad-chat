import React, { useState } from 'react'
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
        <div className="p-6 max-w-7xl mx-auto space-y-6">
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('lines')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            viewMode === 'lines'
                                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <Smartphone size={14} />
                        <span>Phone Numbers & Lines ({connections.length})</span>
                    </button>
                    <button
                        onClick={() => setViewMode('analytics')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            viewMode === 'analytics'
                                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <Activity size={14} />
                        <span>Enterprise Multi-WABA Analytics</span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setShowRouterModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                >
                    <GitBranch size={14} className="text-orange-500" />
                    <span>Inbound Routing Rules</span>
                </button>
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
