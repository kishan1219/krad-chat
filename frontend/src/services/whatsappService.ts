import httpConfig from '../utility/http/httpConfig'

export interface MetaOnboardingConfig {
    configured: boolean
    app_id: string | null
    config_id: string | null
    graph_version: string | null
    simulated: boolean
}

export interface MetaOnboardingSession {
    app_id: string
    config_id: string
    graph_version: string
    state: string
    simulated: boolean
    expires_in: number
    configured: boolean
}

export interface MetaWabaPhoneNumber {
    id: string
    display_phone_number: string
    verified_name?: string
    quality_rating?: string
    messaging_limit_tier?: string
    code_verification_status?: string
    name_status?: string
}

export interface MetaConnection {
    id: number
    tenant_id: number
    name: string
    display_phone_number?: string
    phone_number_id: string
    waba_id: string
    quality_rating?: string
    messaging_limit_tier?: string
    verified_name?: string
    code_verification_status?: string
    name_status?: 'APPROVED' | 'AVAILABLE_WITHOUT_REVIEW' | 'PENDING_REVIEW' | 'DECLINED' | 'REJECTED' | string
    last_name_status_check?: string
    oba_status?: 'NOT_ELIGIBLE' | 'ELIGIBLE' | 'IN_REVIEW' | 'APPROVED' | string
    profile_picture_url?: string
    profile_about?: string
    delivery_rate_24h?: number
    status: 'connected' | 'disconnected' | 'verified' | string
    simulated?: boolean
    subscribed?: boolean
    registered?: boolean
    last_sync_at?: string
    last_error?: string | null
    templates?: Array<Record<string, unknown>>
    created_at?: string
}

export type WhatsAppConnection = MetaConnection

export interface SaveMetaConfigPayload {
    app_id: string
    config_id: string
    graph_version?: string
    app_secret: string
}

export interface CreateConnectionPayload {
    name: string
    waba_id: string
    phone_number_id: string
    display_phone_number?: string
    access_token?: string
}

export interface CompleteOnboardingPayload {
    state: string
    code: string
    name: string
    waba_id?: string
    phone_number_id?: string
}

export interface BatchConnectPayload {
    waba_id: string
    access_token?: string
    numbers: Array<{
        phone_number_id: string
        name: string
    }>
}

export interface RequestCodePayload {
    code_method: 'SMS' | 'VOICE'
    language?: string
}

export interface ChatHistorySyncPayload {
    raw_text?: string
    content_base64?: string
    filename?: string
}

export interface ChatHistorySyncResult {
    success: boolean
    imported_count: number
    conversations_count: number
    contacts: string[]
    message?: string
}

export interface QualityForecastResult {
    connection_id: number
    phone_number_id: string
    display_phone_number?: string
    current_quality: string
    predicted_quality: string
    block_rate_percentage: number
    delivery_success_rate?: number
    threshold_percentage: number
    threshold_exceeded: boolean
    risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
    hours_to_downgrade: number | null
    sample_size_24h: number
    recommendations: string[]
}

export interface MultiWabaDashboardData {
    total_wabas: number
    total_phone_numbers: number
    total_messages_7d: number
    active_connections: number
    quality_summary: {
        green: number
        yellow: number
        red: number
        unknown: number
    }
    wabas: Array<{
        waba_id: string
        name: string
        phone_count: number
        messaging_limit: string
        quality_rating: string
        status: string
        phone_numbers: Array<{
            id: number
            phone_number_id: string
            name: string
            display_phone_number?: string
            quality_rating?: string
            messaging_limit_tier?: string
            status: string
        }>
    }>
    time_series: Array<{
        date: string
        sent: number
        delivered: number
        failed: number
    }>
}

export interface WabaRoutingRule {
    id: number
    name: string
    rule_type: 'geo' | 'department' | 'keyword' | 'intent' | 'fallback'
    match_pattern: string
    target_phone_number_id: string
    target_waba_id: string
    department: string
    target_pod_id?: number | null
    confidence_threshold?: number
    pod_name?: string
    priority: number
    active: boolean
    created_at?: string
    updated_at?: string
}

export interface CreateRoutingRulePayload {
    name: string
    rule_type: 'geo' | 'department' | 'keyword' | 'intent' | 'fallback'
    match_pattern: string
    target_phone_number_id: string
    target_waba_id: string
    department?: string
    target_pod_id?: number | null
    confidence_threshold?: number
    priority?: number
    active?: boolean
}

export interface AgentPod {
    id: number
    tenant_id: number
    name: string
    department: string
    skills: string[]
    lead_user_id?: number | null
    member_user_ids: number[]
    max_active_chats: number
    active: boolean
    lead_name?: string
    lead_email?: string
    open_chats_count?: number
    created_at?: string
    updated_at?: string
}

export interface CreateAgentPodPayload {
    name: string
    department?: string
    skills?: string[]
    lead_user_id?: number | null
    member_user_ids?: number[]
    max_active_chats?: number
    active?: boolean
}

export interface IntentClassificationResult {
    intent: string
    confidence: number
    reasoning: string
    suggested_pod: string
    provider: string
}

export interface TierHeadroomResult {
    tier: string
    tier_limit: number
    dispatched_today: number
    safe_headroom: number
    needs_batching: boolean
    recommended_batches: Array<{
        batchIndex: number
        count: number
        scheduledAt: string
        delayHours: number
    }>
}

export interface PaymentTransaction {
    id: number
    tenant_id: number
    conversation_id?: number | null
    provider: string
    payment_type: 'upi' | 'meta_pay' | 'card' | 'netbanking'
    status: 'success' | 'pending' | 'failed' | 'canceled'
    reference_id: string
    transaction_id: string
    amount_paise: number
    currency: string
    customer_phone: string
    refunded_amount_paise?: number
    refund_status?: 'none' | 'partial' | 'full'
    raw_payload?: Record<string, unknown>
    created_at: string
    updated_at: string
}

export interface PaymentRefund {
    id: number
    tenant_id: number
    payment_transaction_id: number
    refund_id: string
    amount_paise: number
    currency: string
    reason?: string
    status: 'initiated' | 'completed' | 'failed'
    initiated_by?: number
    initiated_by_name?: string
    created_at: string
}

export interface IssueRefundPayload {
    amount_paise: number
    reason?: string
}

export interface TierUpgradeForecastResult {
    connection_id: number
    phone_number_id: string
    display_phone_number?: string
    current_tier: string
    target_tier: string
    quality_rating: string
    green_streak_days: number
    required_green_days: number
    volume_7d: number
    volume_target_7d: number
    volume_progress_percent: number
    estimated_days_remaining: number | null
    status: 'on_track' | 'needs_volume' | 'at_risk_quality' | 'max_tier'
    readiness_score: number
    recommendations: string[]
}

export interface SiblingPoolHeadroomResult {
    pool_enabled: boolean
    line_count: number
    total_pooled_headroom: number
    lines: Array<{
        id: number
        name: string
        phone_number_id: string
        display_phone_number?: string
        tier: string
        tier_limit: number
        safe_headroom: number
        quality_rating: string
    }>
    allocated_batches: Array<{
        phoneNumberId: string
        displayPhoneNumber: string
        count: number
        percentage: number
    }>
}

export interface SimulateRouteResult {
    routed: boolean
    rule_id: number | null
    rule_name: string
    target_phone_number_id: string
    target_waba_id: string
    department: string
    reason: string
}

export interface SafeguardStatusResult {
    safeguard_active: boolean
    broadcasts_paused: boolean
    block_rate: number
    threshold: number
    affected_numbers: Array<{
        id: number
        phone_number_id: string
        display_phone_number?: string
        quality_rating?: string
    }>
    paused_campaigns_count: number
}

export interface IncrementalSyncPayload {
    raw_text?: string
    content_base64?: string
    filename?: string
    simulated_poll?: boolean
}

export interface IncrementalSyncResult {
    success: boolean
    incremental: boolean
    imported_count: number
    skipped_count: number
    watermark: string
    last_sync_at: string
}

export interface SyncScheduleResult {
    id: number
    phone_number_id: string
    sync_schedule: {
        poll_enabled: boolean
        poll_interval_hours: number
        last_poll_at: string | null
    }
    sync_watermark?: string | null
    last_sync_at?: string | null
    incremental_sync_count: number
}

function getAuthToken(): string {
    let token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || ''
    try {
        if (token.startsWith('"') || token.startsWith('{')) {
            const parsed = JSON.parse(token)
            token = typeof parsed === 'string' ? parsed : (parsed?.accessToken || parsed?.token || token)
        }
    } catch {
        // use raw token if json parse fails
    }
    return token
}

async function refreshAuthToken(): Promise<string | null> {
    try {
        let refreshToken = localStorage.getItem('refresh_token') || ''
        if (refreshToken.startsWith('"')) {
            try { refreshToken = JSON.parse(refreshToken) } catch {}
        }
        if (!refreshToken) return null

        const res = await fetch(`${httpConfig.baseUrl}auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
        })
        if (!res.ok) return null
        const data = await res.json()
        const newAccess = data?.data?.access_token || data?.access_token
        const newRefresh = data?.data?.refresh_token || data?.refresh_token
        if (newAccess) {
            localStorage.setItem('access_token', JSON.stringify(newAccess))
            localStorage.setItem('accessToken', JSON.stringify(newAccess))
            if (newRefresh) {
                localStorage.setItem('refresh_token', JSON.stringify(newRefresh))
            }
            return newAccess
        }
    } catch {}
    return null
}

async function requestApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken()
    const url = `${httpConfig.baseUrl}${endpoint.replace(/^\/+/, '')}`

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {})
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        })

        const json = await response.json().catch(() => ({}))

        if (!response.ok) {
            const isRetry = Boolean((headers as any)._isRetry)
            if (response.status === 401 && !isRetry) {
                const refreshedToken = await refreshAuthToken()
                if (refreshedToken) {
                    return requestApi<T>(endpoint, {
                        ...options,
                        headers: {
                            ...headers,
                            Authorization: `Bearer ${refreshedToken}`,
                            _isRetry: 'true'
                        }
                    })
                }
            }
            const errorMessage = json?.message || `Request failed with status ${response.status}`
            throw new Error(errorMessage)
        }

        return (json?.data !== undefined ? json.data : json) as T
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw err
        }
        throw new Error('An unexpected network error occurred.')
    }
}

export const whatsappService = {
    async getOnboardingConfig(): Promise<MetaOnboardingConfig> {
        return requestApi<MetaOnboardingConfig>('whatsapp/onboarding/config', {
            method: 'GET'
        })
    },

    async saveOnboardingConfig(payload: SaveMetaConfigPayload): Promise<{ success: boolean; configured: boolean }> {
        return requestApi<{ success: boolean; configured: boolean }>('whatsapp/onboarding/config', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async beginOnboarding(mode: 'live' | 'sandbox' = 'live'): Promise<MetaOnboardingSession> {
        return requestApi<MetaOnboardingSession>('whatsapp/onboarding/begin', {
            method: 'POST',
            body: JSON.stringify({ mode })
        })
    },

    async completeOnboarding(payload: CompleteOnboardingPayload): Promise<MetaConnection> {
        return requestApi<MetaConnection>('whatsapp/onboarding/complete', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async fetchWabaPhoneNumbers(wabaId: string, code?: string, accessToken?: string): Promise<{
        waba_id: string
        access_token: string
        numbers: MetaWabaPhoneNumber[]
    }> {
        return requestApi<{
            waba_id: string
            access_token: string
            numbers: MetaWabaPhoneNumber[]
        }>('whatsapp/onboarding/waba-numbers', {
            method: 'POST',
            body: JSON.stringify({ waba_id: wabaId, code, access_token: accessToken })
        })
    },

    async getConnections(): Promise<MetaConnection[]> {
        return requestApi<MetaConnection[]>('whatsapp/connections', {
            method: 'GET'
        })
    },

    async createConnection(payload: CreateConnectionPayload): Promise<MetaConnection> {
        return requestApi<MetaConnection>('whatsapp/connections', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async detectWaba(accessToken: string): Promise<{
        detected: boolean
        waba_id: string
        waba_name: string
        currency: string
        phone_numbers: MetaWabaPhoneNumber[]
    }> {
        return requestApi('whatsapp/detect-waba', {
            method: 'POST',
            body: JSON.stringify({ access_token: accessToken })
        })
    },

    async pollLiveProfile(id: string | number): Promise<{
        id: number
        phone_number_id: string
        display_phone_number: string
        verified_name: string
        quality_rating: string
        code_verification_status: string
        messaging_limit_tier: string
        name_status: string
        approved: boolean
        last_sync_at: string
    }> {
        return requestApi(`whatsapp/connections/${id}/live-profile`, {
            method: 'GET'
        })
    },

    async batchConnect(payload: BatchConnectPayload): Promise<{ connected: MetaConnection[]; count: number }> {
        return requestApi<{ connected: MetaConnection[]; count: number }>('whatsapp/connections/batch', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async connectionAction<T = unknown>(
        id: string | number,
        action: 'subscribe' | 'register' | 'sync' | 'disconnect' | 'request-code',
        body: Record<string, unknown> = {}
    ): Promise<T> {
        return requestApi<T>(`whatsapp/connections/${id}/${action}`, {
            method: 'POST',
            body: JSON.stringify(body)
        })
    },

    async requestCode(
        id: string | number,
        payload: RequestCodePayload
    ): Promise<{ success: boolean; method: string; simulated?: boolean }> {
        return requestApi<{ success: boolean; method: string; simulated?: boolean }>(
            `whatsapp/connections/${id}/request-code`,
            {
                method: 'POST',
                body: JSON.stringify(payload)
            }
        )
    },

    async registerNumber(
        id: string | number,
        pin: string
    ): Promise<{ success: boolean; registered?: boolean }> {
        return requestApi<{ success: boolean; registered?: boolean }>(
            `whatsapp/connections/${id}/register`,
            {
                method: 'POST',
                body: JSON.stringify({ pin })
            }
        )
    },

    async deleteTemplate(connectionId: string | number, templateId: string, name: string): Promise<void> {
        await requestApi(`whatsapp/connections/${connectionId}/templates/delete`, {
            method: 'POST',
            body: JSON.stringify({ id: templateId, name })
        })
    },

    async syncChatHistory(id: string | number, payload: ChatHistorySyncPayload): Promise<ChatHistorySyncResult> {
        return requestApi<ChatHistorySyncResult>(`whatsapp/connections/${id}/chat-history-sync`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async getQualityForecast(id: string | number): Promise<QualityForecastResult> {
        return requestApi<QualityForecastResult>(`whatsapp/connections/${id}/quality-forecast`, {
            method: 'GET'
        })
    },

    async getMultiWabaDashboard(): Promise<MultiWabaDashboardData> {
        return requestApi<MultiWabaDashboardData>('whatsapp/multi-waba/dashboard', {
            method: 'GET'
        })
    },

    async getRoutingRules(): Promise<WabaRoutingRule[]> {
        return requestApi<WabaRoutingRule[]>('whatsapp/router/rules', { method: 'GET' })
    },

    async createRoutingRule(payload: CreateRoutingRulePayload): Promise<WabaRoutingRule> {
        return requestApi<WabaRoutingRule>('whatsapp/router/rules', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async updateRoutingRule(id: number | string, payload: Partial<CreateRoutingRulePayload>): Promise<WabaRoutingRule> {
        return requestApi<WabaRoutingRule>(`whatsapp/router/rules/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
    },

    async deleteRoutingRule(id: number | string): Promise<{ deleted: boolean }> {
        return requestApi<{ deleted: boolean }>(`whatsapp/router/rules/${id}`, { method: 'DELETE' })
    },

    async simulateRoute(phone: string, text: string): Promise<SimulateRouteResult> {
        return requestApi<SimulateRouteResult>('whatsapp/router/simulate', {
            method: 'POST',
            body: JSON.stringify({ phone, text })
        })
    },

    async getSafeguardStatus(): Promise<SafeguardStatusResult> {
        return requestApi<SafeguardStatusResult>('whatsapp/safeguards/status', { method: 'GET' })
    },

    async overrideSafeguard(): Promise<{ success: boolean; message: string; resumed_count: number }> {
        return requestApi<{ success: boolean; message: string; resumed_count: number }>('whatsapp/safeguards/override', {
            method: 'POST'
        })
    },

    async syncIncrementalChatHistory(id: string | number, payload: IncrementalSyncPayload): Promise<IncrementalSyncResult> {
        return requestApi<IncrementalSyncResult>(`whatsapp/connections/${id}/incremental-sync`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async getSyncSchedule(id: string | number): Promise<SyncScheduleResult> {
        return requestApi<SyncScheduleResult>(`whatsapp/connections/${id}/sync-schedule`, { method: 'GET' })
    },

    async updateSyncSchedule(id: string | number, payload: { poll_enabled: boolean; poll_interval_hours: number }): Promise<SyncScheduleResult> {
        return requestApi<SyncScheduleResult>(`whatsapp/connections/${id}/sync-schedule`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    // Agent Pods
    async getAgentPods(): Promise<AgentPod[]> {
        return requestApi<AgentPod[]>('agent-pods', { method: 'GET' })
    },

    async createAgentPod(payload: CreateAgentPodPayload): Promise<AgentPod> {
        return requestApi<AgentPod>('agent-pods', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async updateAgentPod(id: number | string, payload: Partial<CreateAgentPodPayload>): Promise<AgentPod> {
        return requestApi<AgentPod>(`agent-pods/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
    },

    async deleteAgentPod(id: number | string): Promise<{ deleted: boolean }> {
        return requestApi<{ deleted: boolean }>(`agent-pods/${id}`, { method: 'DELETE' })
    },

    // AI Intent Classification
    async classifyIntent(text: string): Promise<IntentClassificationResult> {
        return requestApi<IntentClassificationResult>('whatsapp/router/classify-intent', {
            method: 'POST',
            body: JSON.stringify({ text })
        })
    },

    // Predictive Campaign Tier Headroom
    async getTierHeadroom(recipientCount: number, phoneNumberId?: string): Promise<TierHeadroomResult> {
        return requestApi<TierHeadroomResult>('whatsapp/campaigns/tier-headroom', {
            method: 'POST',
            body: JSON.stringify({ recipient_count: recipientCount, phone_number_id: phoneNumberId })
        })
    },

    // Native WhatsApp Payments (Meta Pay & UPI)
    async getPaymentTransactions(conversationId?: number | string): Promise<{ data: PaymentTransaction[]; total: number }> {
        const query = conversationId ? `?conversation_id=${conversationId}` : ''
        return requestApi<{ data: PaymentTransaction[]; total: number }>(`whatsapp/payments/transactions${query}`, {
            method: 'GET'
        })
    },

    async getPaymentTransaction(id: number | string): Promise<PaymentTransaction> {
        return requestApi<PaymentTransaction>(`whatsapp/payments/transactions/${id}`, {
            method: 'GET'
        })
    },

    // Instant In-Chat Payment Refunds
    async issueRefund(transactionId: number | string, payload: IssueRefundPayload): Promise<{
        success: boolean
        refund: PaymentRefund
        transaction: PaymentTransaction
    }> {
        return requestApi<{ success: boolean; refund: PaymentRefund; transaction: PaymentTransaction }>(
            `whatsapp/payments/transactions/${transactionId}/refund`,
            {
                method: 'POST',
                body: JSON.stringify(payload)
            }
        )
    },

    async listRefunds(transactionId: number | string): Promise<PaymentRefund[]> {
        return requestApi<PaymentRefund[]>(`whatsapp/payments/transactions/${transactionId}/refunds`, {
            method: 'GET'
        })
    },

    // Predictive Tier Upgrade Countdown
    async getTierUpgradeForecast(connectionId: number | string): Promise<TierUpgradeForecastResult> {
        return requestApi<TierUpgradeForecastResult>(`whatsapp/connections/${connectionId}/tier-forecast`, {
            method: 'GET'
        })
    },

    // Multi-WABA Sibling Load Balancing
    async getSiblingPoolHeadroom(recipientCount: number): Promise<SiblingPoolHeadroomResult> {
        return requestApi<SiblingPoolHeadroomResult>('whatsapp/campaigns/sibling-pool-headroom', {
            method: 'POST',
            body: JSON.stringify({ recipient_count: recipientCount })
        })
    },

    // Official Business Account (OBA Green Checkmark) Status Tracker & Application
    async getObaStatus(connectionId: number | string): Promise<any> {
        return requestApi(`whatsapp/connections/${connectionId}/oba-status`, {
            method: 'GET'
        })
    },

    async applyOba(connectionId: number | string): Promise<any> {
        return requestApi(`whatsapp/connections/${connectionId}/oba-apply`, {
            method: 'POST'
        })
    },

    // Automated Display Name Re-Review Submission
    async resubmitDisplayName(connectionId: number | string, newName: string): Promise<any> {
        return requestApi(`whatsapp/connections/${connectionId}/resubmit-name`, {
            method: 'POST',
            body: JSON.stringify({ new_name: newName })
        })
    },

    // WABA Template Sync Scheduler & Manual Sync
    async syncTemplates(connectionId: number | string): Promise<any> {
        return requestApi(`whatsapp/connections/${connectionId}/sync-templates`, {
            method: 'POST'
        })
    },

    // In-App Webhook Health Diagnostic
    async getWebhookHealth(): Promise<{
        status: string
        round_trip_latency_ms: number
        last_event_at: string
        uptime_percentage: string
        webhook_endpoint: string
    }> {
        return requestApi('whatsapp/webhook-health', {
            method: 'GET'
        })
    },

    // Automated WhatsApp Business Profile Media CDN
    async getBusinessProfile(connectionId: number | string): Promise<{
        connection_id: number
        phone_number_id: string
        name: string
        verified_name?: string
        oba_status: string
        profile_picture_url: string | null
        about: string
        description?: string
        email?: string
        websites?: string[]
        address?: string
    }> {
        return requestApi(`whatsapp/connections/${connectionId}/profile-avatar`, {
            method: 'GET'
        })
    },

    async uploadProfileAvatar(
        connectionId: number | string,
        payload: { image_base64: string; filename?: string; about?: string; description?: string }
    ): Promise<{
        success: boolean
        connection_id: number
        phone_number_id: string
        profile_picture_url: string
        profile_picture_handle: string
        dimensions: string
        format: string
        file_size_bytes: number
        message: string
    }> {
        return requestApi(`whatsapp/connections/${connectionId}/profile-avatar`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    async deleteProfileAvatar(connectionId: number | string): Promise<{ success: boolean; message: string }> {
        return requestApi(`whatsapp/connections/${connectionId}/profile-avatar`, {
            method: 'DELETE'
        })
    }
}
