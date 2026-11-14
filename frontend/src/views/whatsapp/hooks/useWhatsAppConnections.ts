import { useEffect, useState, useCallback } from 'react'
import { whatsappService, MetaConnection, RequestCodePayload } from '../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../utility/Utils'
import useWebSockets from '../../../utility/hooks/useSocket'

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

    const { lastMessage } = useWebSockets()

    // Real-Time WABA Webhook Syncing: Instant phone_number_name_update, quality_update, tier_upgrade, and OBA reflections
    useEffect(() => {
        if (!lastMessage) return
        const payload = lastMessage

        // 1. Instant phone_number_name_update reflection
        if (payload.type === 'meta.name_approved' || payload.type === 'meta_name_approved') {
            const phoneId = payload.phone_number_id
            const verifiedName = payload.verified_name
            const nameStatus = payload.name_status || 'APPROVED'

            setConnections(prev => prev.map(c => {
                if (c.phone_number_id === phoneId || c.id === payload.connection_id) {
                    return {
                        ...c,
                        verified_name: verifiedName || c.verified_name,
                        name_status: nameStatus
                    }
                }
                return c
            }))

            SuccessToast(payload.message || `🎉 Meta approved Display Name '${verifiedName}'!`)
            void fetchConnections()
        }

        // 2. Instant phone_number_quality_update & tier upgrade reflection
        if (
            payload.type === 'meta.quality_update' ||
            payload.type === 'meta_quality_degradation' ||
            payload.type === 'meta_tier_upgrade'
        ) {
            const phoneId = payload.phone_number_id || payload.data?.phone_number_id
            const quality = payload.quality_rating || payload.data?.quality || payload.data?.current_quality
            const tier = payload.messaging_limit_tier || payload.data?.tier || payload.data?.current_tier
            const verifiedName = payload.verified_name

            setConnections(prev => prev.map(c => {
                if (c.phone_number_id === phoneId || c.id === payload.connection_id) {
                    return {
                        ...c,
                        ...(quality ? { quality_rating: quality } : {}),
                        ...(tier ? { messaging_limit_tier: tier } : {}),
                        ...(verifiedName ? { verified_name: verifiedName } : {})
                    }
                }
                return c
            }))

            if (payload.type === 'meta_quality_degradation') {
                ErrorToast(`⚠️ WhatsApp Quality Rating Downgraded to ${quality}!`)
            } else if (payload.type === 'meta_tier_upgrade') {
                SuccessToast(`🚀 WhatsApp Messaging Limit Tier Upgraded to ${tier}!`)
            }
            void fetchConnections()
        }

        // 3. Instant Official Business Account (Green Checkmark) reflection
        if (payload.type === 'meta_oba_approved' || payload.type === 'meta.oba_update' || payload.type === 'meta_oba_eligible') {
            const phoneId = payload.phone_number_id || payload.data?.phone_number_id
            const obaStatus = payload.oba_status || payload.data?.oba_status || (payload.type === 'meta_oba_eligible' ? 'ELIGIBLE' : 'APPROVED')

            setConnections(prev => prev.map(c => {
                if (c.phone_number_id === phoneId || c.id === payload.connection_id) {
                    return { ...c, oba_status: obaStatus }
                }
                return c
            }))

            if (payload.type === 'meta_oba_approved') {
                SuccessToast('🎉 Meta has approved your Official Business Account (Green Checkmark)!')
            } else if (payload.type === 'meta_oba_eligible') {
                SuccessToast('★ Milestone Reached! Tier 10K+ unlocked - OBA Green Checkmark application is now available.')
            }
            void fetchConnections()
        }

        // 4. Instant Template Status update
        if (payload.type === 'meta_template_status_update' || payload.type === 'meta.template_approved') {
            void fetchConnections()
        }
    }, [lastMessage, fetchConnections])

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
