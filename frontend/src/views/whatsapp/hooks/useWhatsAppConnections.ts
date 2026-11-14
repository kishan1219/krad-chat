import { useEffect, useState, useCallback } from 'react'
import { whatsappService, MetaConnection, RequestCodePayload } from '../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../utility/Utils'

export interface DegradationAlertInfo {
    id?: number
    title: string
    message: string
    phoneNumber: string
    phoneNumberId: string
    previousQuality: string
    newQuality: string
    currentQuality: string
    severity: 'critical' | 'warning'
    timestamp: string
}

export function useWhatsAppConnections() {
    const [connections, setConnections] = useState<MetaConnection[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [actionBusyId, setActionBusyId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [notice, setNotice] = useState<string>('')
    const [selectedConnection, setSelectedConnection] = useState<MetaConnection | null>(null)
    const [degradationAlerts, setDegradationAlerts] = useState<DegradationAlertInfo[]>([])

    const fetchConnections = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await whatsappService.getConnections()
            setConnections(data)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Could not fetch connections'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void fetchConnections()
    }, [fetchConnections])

    // WebSocket listener for real-time quality degradation and tier upgrades
    useEffect(() => {
        const handleWsMessage = (e: MessageEvent) => {
            try {
                const payload = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
                if (payload?.command === 'notification' || payload?.type) {
                    if (payload.type === 'meta_quality_degradation') {
                        const alertData = payload.data || {}
                        const quality = alertData.current_quality || alertData.quality || 'YELLOW'
                        const newAlert: DegradationAlertInfo = {
                            title: alertData.title || 'WhatsApp Quality Rating Downgraded',
                            message: alertData.message || '',
                            phoneNumber: alertData.phone_number || '',
                            phoneNumberId: alertData.phone_number_id || '',
                            previousQuality: alertData.previous_quality || 'GREEN',
                            newQuality: quality,
                            currentQuality: quality,
                            severity: alertData.severity || 'warning',
                            timestamp: alertData.degraded_at || new Date().toISOString()
                        }
                        setDegradationAlerts(prev => [newAlert, ...prev])
                        ErrorToast(`${newAlert.title}: ${newAlert.message}`)
                        void fetchConnections()
                    } else if (payload.type === 'meta_tier_upgrade') {
                        SuccessToast(`Messaging limit upgraded: ${payload.data?.tier || 'New Tier'}`)
                        void fetchConnections()
                    }
                }
            } catch {
                // Ignore non-json or unformatted messages
            }
        }

        window.addEventListener('message', handleWsMessage)
        return () => window.removeEventListener('message', handleWsMessage)
    }, [fetchConnections])

    // Real-Time Meta Display Name & Profile Status Polling
    useEffect(() => {
        const pendingConns = connections.filter(
            c => (c.status === 'connected' || c.status === 'verified') && 
                 (c.name_status === 'PENDING_REVIEW' || !c.verified_name || c.quality_rating === 'UNKNOWN')
        )
        if (pendingConns.length === 0) return

        const interval = setInterval(async () => {
            for (const conn of pendingConns) {
                try {
                    const profile = await whatsappService.pollLiveProfile(conn.id)
                    if (profile.approved || profile.name_status === 'APPROVED') {
                        SuccessToast(`🎉 Meta approved Display Name '${profile.verified_name || 'Krad Technology'}'! WhatsApp line is active.`)
                        await fetchConnections()
                        break
                    }
                } catch {
                    // silent retry
                }
            }
        }, 15000)

        return () => clearInterval(interval)
    }, [connections, fetchConnections])

    const handleSync = useCallback(async (id: number) => {
        setActionBusyId(id)
        try {
            await whatsappService.connectionAction(id, 'sync')
            SuccessToast('Limits and templates synchronized with Meta.')
            await fetchConnections()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Sync failed'
            ErrorToast(msg)
        } finally {
            setActionBusyId(null)
        }
    }, [fetchConnections])

    const handleToggleStatus = useCallback(async (conn: MetaConnection) => {
        setActionBusyId(conn.id)
        const isConnected = conn.status === 'connected' || conn.status === 'verified'
        const nextAction = isConnected ? 'disconnect' : 'subscribe'
        try {
            await whatsappService.connectionAction(conn.id, nextAction)
            SuccessToast(`WhatsApp line ${nextAction}ed successfully.`)
            await fetchConnections()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : `Failed to ${nextAction} connection`
            ErrorToast(msg)
        } finally {
            setActionBusyId(null)
        }
    }, [fetchConnections])

    const handleDelete = useCallback(async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this WhatsApp configuration?')) return
        setActionBusyId(id)
        try {
            await whatsappService.connectionAction(id, 'disconnect')
            SuccessToast('WhatsApp line deleted.')
            await fetchConnections()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to delete connection'
            ErrorToast(msg)
        } finally {
            setActionBusyId(null)
        }
    }, [fetchConnections])

    const dismissAlerts = () => {
        setDegradationAlerts([])
    }

    const requestCoExistenceCode = useCallback(async (
        id: number | string,
        payload: RequestCodePayload
    ) => {
        setActionBusyId(typeof id === 'number' ? id : parseInt(id, 10))
        setError('')
        try {
            const res = await whatsappService.requestCode(id, payload)
            SuccessToast(`Verification OTP sent via ${payload.code_method}. Check your phone.`)
            return res
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to request OTP code'
            setError(msg)
            ErrorToast(msg)
            throw err
        } finally {
            setActionBusyId(null)
        }
    }, [])

    return {
        connections,
        loading,
        actionBusyId,
        searchTerm,
        setSearchTerm,
        error,
        setError,
        notice,
        setNotice,
        selectedConnection,
        setSelectedConnection,
        degradationAlerts,
        dismissAlerts,
        fetchConnections,
        handleSync,
        handleToggleStatus,
        handleDelete,
        requestCoExistenceCode
    }
}
