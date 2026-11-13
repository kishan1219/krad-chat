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
    waba_id: string
    phone_number_id: string
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
    rule_type: 'geo' | 'department' | 'keyword' | 'fallback'
    match_pattern: string
    target_phone_number_id: string
    target_waba_id: string
    department: string
    priority: number
    active: boolean
    created_at?: string
    updated_at?: string
}

export interface CreateRoutingRulePayload {
    name: string
    rule_type: 'geo' | 'department' | 'keyword' | 'fallback'
    match_pattern: string
    target_phone_number_id: string
    target_waba_id: string
    department?: string
    priority?: number
    active?: boolean
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
    }
}
