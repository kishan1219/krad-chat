import React, { useState } from 'react'
import { useWhatsAppConnections } from './hooks/useWhatsAppConnections'
import { ConnectionsHeader } from './components/connections/ConnectionsHeader'
import { ConnectionsMetrics } from './components/connections/ConnectionsMetrics'
import { QualityDegradationBanner } from './components/connections/QualityDegradationBanner'
import { ManualCredentialsCard } from './components/connections/ManualCredentialsCard'
import { ConnectionsTable } from './components/connections/ConnectionsTable'
import { CoExistenceMigrationModal } from './components/connections/CoExistenceMigrationModal'
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

    const [search, setSearch] = useState('')
    const [showManual, setShowManual] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [coExistenceConn, setCoExistenceConn] = useState<WhatsAppConnection | null>(null)

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

            {/* Quality Degradation Alert Banner (Real-time Meta Alerts) */}
            <QualityDegradationBanner
                alerts={degradationAlerts}
                onDismiss={dismissAlerts}
            />

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
                onOpenAddModal={() => setShowAddModal(true)}
            />

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
        </div>
    )
}
