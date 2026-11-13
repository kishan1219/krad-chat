import { useEffect, useRef, useState } from 'react'
import Papa from 'papaparse'
import {
    Alert,
    Badge,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardTitle,
    Col,
    Input,
    Label,
    Row,
    Table
} from 'reactstrap'
import {
    UploadCloud,
    FileText,
    Image as ImageIcon,
    File,
    Music,
    Video,
    AlertTriangle,
    CreditCard,
    ExternalLink,
    CheckCircle
} from 'react-feather'
import httpConfig from '../../utility/http/httpConfig'

function formatTier(tier?: string) {
    switch (tier) {
        case 'TIER_50': return '50 msgs / 24 hrs (Trial)'
        case 'TIER_250': return '250 msgs / 24 hrs'
        case 'TIER_1K': return '1,000 msgs / 24 hrs (Tier 1)'
        case 'TIER_10K': return '10,000 msgs / 24 hrs (Tier 2)'
        case 'TIER_100K': return '100,000 msgs / 24 hrs (Tier 3)'
        case 'TIER_UNLIMITED': return 'Unlimited messages'
        default: return tier || '1,000 msgs / 24 hrs'
    }
}

function getTierBadgeColor(tier?: string) {
    switch (tier) {
        case 'TIER_50': return 'light-warning'
        case 'TIER_250': return 'light-info'
        case 'TIER_1K': return 'light-primary'
        case 'TIER_10K': return 'light-success'
        case 'TIER_100K': return 'success'
        case 'TIER_UNLIMITED': return 'primary'
        default: return 'light-secondary'
    }
}

function extractVariables(template: any): string[] {
    if (!template) return []
    const texts: string[] = []
    if (Array.isArray(template.components)) {
        for (const comp of template.components) {
            if ((comp.type === 'BODY' || comp.type === 'HEADER') && comp.text) {
                texts.push(comp.text)
            }
        }
    }
    if (template.body && typeof template.body === 'string') texts.push(template.body)
    if (template.text && typeof template.text === 'string') texts.push(template.text)

    const combined = texts.join('\n')
    const matches = combined.match(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g) || []
    const vars: string[] = []
    for (const m of matches) {
        const cleaned = m.replace(/[{}]/g, '').trim()
        if (!vars.includes(cleaned)) {
            vars.push(cleaned)
        }
    }
    return vars.sort((a, b) => {
        const numA = Number(a)
        const numB = Number(b)
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB
        return a.localeCompare(b)
    })
}

function renderTemplateWithValues(text: string, vars: Record<string, string>) {
    if (!text) return null
    const parts = text.split(/({{\s*[a-zA-Z0-9_-]+\s*}})/g)
    return parts.map((part, index) => {
        const match = part.match(/{{\s*([a-zA-Z0-9_-]+)\s*}}/)
        if (match) {
            const varKey = match[1].trim()
            const val = vars[varKey]
            return (
                <span
                    key={index}
                    className={`px-1 mx-1 rounded fw-bold ${val ? 'bg-primary text-white' : 'bg-warning text-dark'}`}
                    style={{ fontSize: '0.9em', display: 'inline-block' }}
                    title={val ? `Variable {{${varKey}}}` : `Missing value for Variable {{${varKey}}}`}
                >
                    {val || `{{${varKey}}}`}
                </span>
            )
        }
        return <span key={index}>{part}</span>
    })
}

export default function Broadcasts() {
    const [senders, setSenders] = useState<any[]>([])
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [policy, setPolicy] = useState<any>(null)
    const [sender, setSender] = useState('')
    const [template, setTemplate] = useState('')
    const [name, setName] = useState('')
    const [recipients, setRecipients] = useState('')
    const [parameters, setParameters] = useState('')
    const [varValues, setVarValues] = useState<Record<string, string>>({})
    const [paramMode, setParamMode] = useState<'guided' | 'raw'>('guided')
    const [schedule, setSchedule] = useState('')
    const [segment, setSegment] = useState('')
    const [audienceType, setAudienceType] = useState<'manual' | 'group' | 'csv'>('manual')
    const [contactGroups, setContactGroups] = useState<any[]>([])
    const [selectedGroup, setSelectedGroup] = useState('')
    const [groupContacts, setGroupContacts] = useState<any[]>([])

    // CSV Direct Drag & Drop State
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [csvRows, setCsvRows] = useState<any[]>([])
    const [csvPhoneColumn, setCsvPhoneColumn] = useState<string>('')
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Wallet & Balance Verification State
    const [wallet, setWallet] = useState<any>(null)

    // WhatsApp Template Header Media State
    const [mediaAssets, setMediaAssets] = useState<any[]>([])
    const [headerMediaSource, setHeaderMediaSource] = useState<'url' | 'asset' | 'column'>('url')
    const [headerMediaUrl, setHeaderMediaUrl] = useState('')
    const [headerMediaAssetId, setHeaderMediaAssetId] = useState('')
    const [headerMediaColumn, setHeaderMediaColumn] = useState('')
    const [headerDocumentFilename, setHeaderDocumentFilename] = useState('Document.pdf')
    const [headerTextParam, setHeaderTextParam] = useState('')

    const [availableColumns, setAvailableColumns] = useState<{ label: string; value: string }[]>([
        { label: 'First Name', value: 'first_name' },
        { label: 'Last Name', value: 'last_name' },
        { label: 'Full Name', value: 'name' },
        { label: 'Company Name', value: 'company' },
        { label: 'Email', value: 'email' },
        { label: 'Phone Number', value: 'phone' }
    ])
    const [varMappings, setVarMappings] = useState<Record<string, { mode: 'column' | 'static'; column: string; value: string }>>({})
    const [consentPhone, setConsentPhone] = useState('')
    const [source, setSource] = useState('')
    const [evidence, setEvidence] = useState('')
    const [optedIn, setOptedIn] = useState(true)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [busy, setBusy] = useState(false)
    const [detail, setDetail] = useState<any>(null)

    function getAuthToken(): string {
        const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || ''
        try {
            if (token.startsWith('"') || token.startsWith('{')) {
                const parsed = JSON.parse(token)
                return typeof parsed === 'string' ? parsed : (parsed?.accessToken || parsed?.token || token)
            }
        } catch {
            return token
        }
        return token
    }

    async function api(path: string, method = 'GET', body?: any, idempotencyKey?: string) {
        const token = getAuthToken()
        const response = await fetch(`${httpConfig.baseUrl}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
            },
            ...(body ? { body: JSON.stringify(body) } : {})
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Request failed')
        return result.data
    }

    async function refresh() {
        const [s, c, p, g, w, m] = await Promise.all([
            api('whatsapp/senders'),
            api('wa-campaigns'),
            api('whatsapp/broadcast-policy').catch(() => null),
            api('contact-groups').catch(() => []),
            api('wallet').catch(() => null),
            api('wa-files').catch(() => [])
        ])
        setSenders(Array.isArray(s) ? s : [])
        setCampaigns(((c && c.data) || []).filter((item: any) => !item.payload?.internal_chat))
        if (p) setPolicy(p)
        const groups = (g && g.data) || (Array.isArray(g) ? g : [])
        setContactGroups(groups)
        if (w) setWallet(w)
        const files = (m && m.data) || (Array.isArray(m) ? m : [])
        setMediaAssets(files)
    }

    async function act(work: () => Promise<void>) {
        setBusy(true)
        setError('')
        setNotice('')
        try {
            await work()
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred')
        } finally {
            setBusy(false)
        }
    }

    useEffect(() => {
        void act(refresh)
    }, [])

    const selectedSender = senders.find(s => String(s.id) === sender)
    const templates = selectedSender?.templates || []
    const selectedTemplate = template !== '' ? templates[Number(template)] : null
    const detectedVars = extractVariables(selectedTemplate)
    const templateBodyText = selectedTemplate?.components?.find((c: any) => c.type === 'BODY')?.text ||
                             selectedTemplate?.body ||
                             selectedTemplate?.text ||
                             ''

    function handleVarChange(key: string, val: string) {
        const updated = { ...varValues, [key]: val }
        setVarValues(updated)
        const lines = detectedVars.map(v => updated[v] || '')
        setParameters(lines.join('\n'))
    }

    function handleRawParamChange(rawText: string) {
        setParameters(rawText)
        const lines = rawText.split('\n')
        const updated: Record<string, string> = {}
        detectedVars.forEach((v, idx) => {
            if (lines[idx] !== undefined) updated[v] = lines[idx]
        })
        setVarValues(updated)
    }

    async function savePolicy(next: any) {
        await api('whatsapp/broadcast-policy', 'POST', {
            daily_limit: Number(next.daily_limit),
            require_approval: next.require_approval,
            paused: next.paused
        })
        await refresh()
    }

    async function handleSelectGroup(groupId: string) {
        setSelectedGroup(groupId)
        if (!groupId) {
            setGroupContacts([])
            return
        }
        await act(async () => {
            const res = await api(`contact-numbers?group_id=${encodeURIComponent(groupId)}`).catch(() => null)
            const contacts = (res && res.data) || (Array.isArray(res) ? res : [])
            setGroupContacts(contacts)

            const dynamicCols = new Set<string>(['first_name', 'last_name', 'name', 'company', 'email', 'phone'])
            contacts.forEach((item: any) => {
                const src = item.data || item
                Object.keys(src).forEach(k => {
                    if (!['id', 'tenant_id', 'group_id', 'created_at', 'updated_at', 'credentials_encrypted'].includes(k)) {
                        dynamicCols.add(k)
                    }
                })
            })

            const cols = Array.from(dynamicCols).map(k => ({
                value: k,
                label: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }))
            setAvailableColumns(cols)

            const phones = contacts.map((c: any) => (c.data?.phone || c.phone || c.mobile || '')).filter(Boolean)
            if (phones.length > 0) {
                setRecipients(phones.join('\n'))
                setNotice(`Loaded ${phones.length} recipient${phones.length > 1 ? 's' : ''} from Contact Group.`)
            }
        })
    }

    function handleMappingModeChange(v: string, mode: 'column' | 'static') {
        const cur = varMappings[v] || { mode: 'column', column: v === '1' ? 'first_name' : v === '2' ? 'company' : 'name', value: '' }
        setVarMappings(prev => ({
            ...prev,
            [v]: { ...cur, mode }
        }))
    }

    function handleMappingColumnChange(v: string, column: string) {
        const cur = varMappings[v] || { mode: 'column', column, value: '' }
        setVarMappings(prev => ({
            ...prev,
            [v]: { ...cur, column }
        }))
    }

    const headerComp = selectedTemplate?.components?.find((c: any) => c.type === 'HEADER') || null
    const headerFormat = (headerComp?.format || (headerComp?.text ? 'TEXT' : 'NONE')).toUpperCase()

    function processCsvFile(file: File) {
        setCsvFile(file)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                const rows = results.data || []
                if (rows.length === 0) {
                    setError('The uploaded CSV file contains no records.')
                    return
                }
                setCsvRows(rows)
                const headers = results.meta?.fields || Object.keys(rows[0] || {})
                const detectedPhoneCol = headers.find((h: string) =>
                    /phone|mobile|contact|tel|number|whatsapp/i.test(h)
                ) || headers[0] || ''
                setCsvPhoneColumn(detectedPhoneCol)

                const cols = headers.map((h: string) => ({
                    value: h,
                    label: h.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                }))
                setAvailableColumns(cols)

                const phones = rows
                    .map((r: any) => String(r[detectedPhoneCol] || '').trim())
                    .filter(Boolean)
                setRecipients(phones.join('\n'))
                setNotice(`Parsed ${rows.length} contacts from CSV "${file.name}". Phone column set to "${detectedPhoneCol}".`)
            },
            error: (err: any) => {
                setError(`Failed to parse CSV file: ${err.message}`)
            }
        })
    }

    function handleCsvPhoneColumnChange(col: string) {
        setCsvPhoneColumn(col)
        if (csvRows.length > 0 && col) {
            const phones = csvRows
                .map((r: any) => String(r[col] || '').trim())
                .filter(Boolean)
            setRecipients(phones.join('\n'))
        }
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files?.[0]
        if (droppedFile) {
            if (!droppedFile.name.toLowerCase().endsWith('.csv') && droppedFile.type !== 'text/csv') {
                setError('Please drop a valid .csv contact spreadsheet.')
                return
            }
            processCsvFile(droppedFile)
        }
    }

    function getSampleContactValue(colKey: string, contactItem: any): string {
        if (!contactItem) return ''
        const src = contactItem.data || contactItem
        if (src[colKey] !== undefined && src[colKey] !== null && String(src[colKey]).trim() !== '') {
            return String(src[colKey])
        }
        if (colKey.toLowerCase().includes('first') || colKey === 'name') {
            return src.first_name || (src.name ? String(src.name).split(' ')[0] : '') || src['First Name'] || 'Valued'
        }
        if (colKey.toLowerCase().includes('last')) {
            return src.last_name || (src.name ? String(src.name).split(' ').slice(1).join(' ') : '') || src['Last Name'] || 'Customer'
        }
        if (colKey === 'name') return src.name || src.full_name || src['Full Name'] || 'Customer'
        if (colKey === 'company') return src.company || src.company_name || src['Company Name'] || src['Company'] || 'Acme Corp'
        if (colKey === 'email') return src.email || src['Email'] || 'customer@example.com'
        if (colKey === 'phone') return src.phone || src.mobile || src['Phone'] || src['Mobile'] || '+919876543210'
        return String(src[colKey] || '')
    }

    const sampleContact = audienceType === 'csv'
        ? (csvRows[0] || null)
        : (groupContacts[0] || null)

    const isDynamicAudience = audienceType === 'group' || audienceType === 'csv'
    const computedSampleVars: Record<string, string> = {}
    detectedVars.forEach(v => {
        const mapping = varMappings[v] || { mode: isDynamicAudience ? 'column' : 'static', column: v === '1' ? 'first_name' : v === '2' ? 'company' : 'name', value: varValues[v] || '' }
        if (isDynamicAudience && mapping.mode === 'column') {
            computedSampleVars[v] = getSampleContactValue(mapping.column, sampleContact) || `[${mapping.column}]`
        } else {
            computedSampleVars[v] = varValues[v] || ''
        }
    })

    const missingVars = detectedVars.filter(v => {
        const mapping = varMappings[v] || { mode: isDynamicAudience ? 'column' : 'static', column: v === '1' ? 'first_name' : v === '2' ? 'company' : 'name', value: varValues[v] || '' }
        if (isDynamicAudience && mapping.mode === 'column') {
            return !mapping.column
        }
        return !(varValues[v] || '').trim()
    })

    // Pre-flight Category-Based Pricing & Balance Verification
    const templateCategory = (selectedTemplate?.category || 'MARKETING').toUpperCase()
    const unitRate = templateCategory === 'UTILITY'
        ? 0.165
        : templateCategory === 'AUTHENTICATION'
        ? 0.165
        : 0.835 // Marketing default

    const recipientList = recipients
        .split(/[,\n]/)
        .map(v => v.trim())
        .filter(Boolean)
    const recipientCount = recipientList.length
    const estimatedCostRupees = Number((recipientCount * unitRate).toFixed(2))
    const availableBalancePaise = Number(wallet?.available ?? ((wallet?.balance || 0) - (wallet?.reserved || 0)))
    const availableBalanceRupees = Number((availableBalancePaise / 100).toFixed(2))
    const creditDeficitRupees = Number((estimatedCostRupees - availableBalanceRupees).toFixed(2))
    const hasSufficientCredits = recipientCount === 0 || availableBalanceRupees >= estimatedCostRupees

    const hasValidMediaHeader = !['IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO'].includes(headerFormat) ||
        Boolean(headerMediaUrl || headerMediaAssetId || (headerMediaSource === 'column' && headerMediaColumn))

    const canSubmit = !busy &&
                      name.trim() &&
                      sender &&
                      template !== '' &&
                      recipientCount > 0 &&
                      hasSufficientCredits &&
                      (detectedVars.length === 0 || missingVars.length === 0) &&
                      hasValidMediaHeader

    return (
        <div className='p-2'>
            <Card>
                <CardBody>
                    <div className='d-flex justify-content-between align-items-center mb-1'>
                        <div>
                            <CardTitle tag='h3' className='mb-0'>WhatsApp Broadcast Campaigns</CardTitle>
                            <p className='text-muted small mb-0'>
                                Send approved Meta WhatsApp templates to customers with recorded opt-in.
                            </p>
                        </div>
                        <Button color='flat-primary' size='sm' disabled={busy} onClick={() => void act(refresh)}>
                            Refresh Senders & Data
                        </Button>
                    </div>

                    {error && <Alert color='danger'>{error}</Alert>}
                    {notice && <Alert color='success'>{notice}</Alert>}

                    <Row className='gy-1'>
                        <Col md={12}>
                            <Label for='broadcast-name' className='fw-bold'>Campaign Name</Label>
                            <Input
                                id='broadcast-name'
                                placeholder='e.g. November Product Launch'
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </Col>

                        <Col md={6}>
                            <Label for='broadcast-sender' className='fw-bold'>Business Sender</Label>
                            <Input
                                id='broadcast-sender'
                                type='select'
                                value={sender}
                                onChange={e => {
                                    setSender(e.target.value)
                                    setTemplate('')
                                    setVarValues({})
                                    setParameters('')
                                }}
                            >
                                <option value=''>Select sender phone number</option>
                                {senders.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.display_phone_number || s.phone_number_id}) · Quality: {s.quality_rating} · Limit: {s.messaging_limit_tier || 'TIER_1K'}
                                    </option>
                                ))}
                            </Input>
                        </Col>

                        <Col md={6}>
                            <Label for='broadcast-template' className='fw-bold'>Approved Template</Label>
                            <Input
                                id='broadcast-template'
                                type='select'
                                value={template}
                                disabled={!sender || templates.length === 0}
                                onChange={e => {
                                    setTemplate(e.target.value)
                                    setVarValues({})
                                    setParameters('')
                                }}
                            >
                                <option value=''>
                                    {!sender
                                        ? 'Select a sender first'
                                        : templates.length === 0
                                        ? 'No approved templates found for this sender'
                                        : 'Select an approved template'}
                                </option>
                                {templates.map((t: any, i: number) => (
                                    <option key={`${t.id || t.name}-${t.language}`} value={String(i)}>
                                        {t.name} ({t.language}) [{t.category || 'MARKETING'}]
                                    </option>
                                ))}
                            </Input>
                        </Col>

                        {selectedSender && (
                            <Col md={12}>
                                <div className='d-flex flex-wrap gap-2 p-1 border rounded bg-light'>
                                    <div>
                                        <span className='text-muted small d-block'>Sender Verified Name</span>
                                        <strong>{selectedSender.verified_name || selectedSender.name || 'WhatsApp Business'}</strong>
                                    </div>
                                    <div>
                                        <span className='text-muted small d-block'>Phone Number</span>
                                        <code>{selectedSender.display_phone_number || selectedSender.phone_number_id}</code>
                                    </div>
                                    <div>
                                        <span className='text-muted small d-block'>Messaging Limit Tier</span>
                                        <Badge color={getTierBadgeColor(selectedSender.messaging_limit_tier)}>
                                            {formatTier(selectedSender.messaging_limit_tier)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className='text-muted small d-block'>Quality Rating</span>
                                        <Badge color={selectedSender.quality_rating === 'GREEN' ? 'success' : selectedSender.quality_rating === 'YELLOW' ? 'warning' : 'secondary'}>
                                            {selectedSender.quality_rating || 'UNKNOWN'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className='text-muted small d-block'>Available Templates</span>
                                        <Badge color='info'>{templates.length} Approved</Badge>
                                    </div>
                                </div>
                            </Col>
                        )}

                        {selectedTemplate && (
                            <Col md={12}>
                                <div className='p-2 border rounded bg-light border-primary'>
                                    <div className='d-flex justify-content-between align-items-center mb-1'>
                                        <div className='fw-bold text-primary'>
                                            Live Message Preview: <code>{selectedTemplate.name}</code> ({selectedTemplate.language})
                                        </div>
                                        <div className='d-flex gap-1 align-items-center'>
                                            <Badge color='info' pill>Category: {templateCategory}</Badge>
                                            {detectedVars.length > 0 && (
                                                <Badge color={missingVars.length === 0 ? 'light-success' : 'light-warning'}>
                                                    {detectedVars.length - missingVars.length} of {detectedVars.length} Variables Filled
                                                </Badge>
                                            )}
                                            <Badge color='success'>{selectedTemplate.status || 'APPROVED'}</Badge>
                                        </div>
                                    </div>
                                    <div className='p-3 bg-white rounded border' style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                                        {/* Template Header Preview */}
                                        {headerFormat !== 'NONE' && (
                                            <div className='mb-2 pb-2 border-bottom'>
                                                {headerFormat === 'IMAGE' && (
                                                    <div className='p-2 bg-light rounded text-center border' style={{ maxHeight: '200px', overflow: 'hidden' }}>
                                                        {headerMediaUrl ? (
                                                            <img
                                                                src={headerMediaUrl}
                                                                alt='Header Preview'
                                                                style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                                                                className='rounded'
                                                                onError={e => { (e.currentTarget as any).src = 'https://placehold.co/600x300?text=Invalid+Image+URL' }}
                                                            />
                                                        ) : (
                                                            <div className='text-muted py-3'>
                                                                <ImageIcon size={32} className='text-primary mb-1 d-block mx-auto' />
                                                                <small className='fw-bold'>Image Header Attachment</small>
                                                                <span className='d-block small text-muted'>Specify media URL or choose from library below</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {headerFormat === 'DOCUMENT' && (
                                                    <div className='p-2 bg-light rounded d-flex align-items-center gap-2 border'>
                                                        <File size={28} className='text-primary flex-shrink-0' />
                                                        <div className='overflow-hidden'>
                                                            <strong className='small d-block text-truncate'>{headerDocumentFilename || 'Document.pdf'}</strong>
                                                            <small className='text-muted'>WhatsApp Document Attachment {headerMediaUrl ? '✓ Ready' : '(URL required)'}</small>
                                                        </div>
                                                    </div>
                                                )}
                                                {headerFormat === 'VIDEO' && (
                                                    <div className='p-3 bg-light rounded text-center border text-muted'>
                                                        <Video size={32} className='text-primary mb-1 d-block mx-auto' />
                                                        <small className='fw-bold'>Video Header Attachment</small>
                                                        <span className='d-block small text-muted'>{headerMediaUrl || 'Specify MP4 video URL below'}</span>
                                                    </div>
                                                )}
                                                {headerFormat === 'AUDIO' && (
                                                    <div className='p-2 bg-light rounded d-flex align-items-center gap-2 border text-muted'>
                                                        <Music size={24} className='text-primary' />
                                                        <small className='fw-bold'>Audio Header Attachment ({headerMediaUrl || 'Audio URL required'})</small>
                                                    </div>
                                                )}
                                                {headerFormat === 'TEXT' && (
                                                    <div className='fw-bold text-dark fs-5'>
                                                        {headerComp?.text ? renderTemplateWithValues(headerComp.text, { '1': headerTextParam || '{{1}}' }) : 'HEADER'}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {templateBodyText ? (
                                            renderTemplateWithValues(templateBodyText, varValues)
                                        ) : (
                                            <span className='text-muted'>Template has no body text or components preview.</span>
                                        )}
                                    </div>
                                </div>
                            </Col>
                        )}

                        {/* Template Header Media / Dynamic Header Configuration */}
                        {selectedTemplate && headerFormat !== 'NONE' && (
                            <Col md={12}>
                                <div className='border rounded p-2 bg-light'>
                                    <div className='d-flex justify-content-between align-items-center mb-1'>
                                        <div>
                                            <h6 className='fw-bold text-dark mb-0'>
                                                Header Attachment Configuration: <Badge color='primary'>{headerFormat}</Badge>
                                            </h6>
                                            <small className='text-muted'>
                                                Meta WhatsApp Cloud API requires media headers to provide a valid accessible URL.
                                            </small>
                                        </div>
                                    </div>

                                    {['IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO'].includes(headerFormat) && (
                                        <div className='mt-2'>
                                            <div className='mb-2'>
                                                <Label className='fw-bold small text-dark me-2'>Media Source:</Label>
                                                <ButtonGroup size='sm'>
                                                    <Button
                                                        color={headerMediaSource === 'url' ? 'primary' : 'outline-primary'}
                                                        onClick={() => setHeaderMediaSource('url')}
                                                    >
                                                        Direct Public URL
                                                    </Button>
                                                    {mediaAssets.length > 0 && (
                                                        <Button
                                                            color={headerMediaSource === 'asset' ? 'primary' : 'outline-primary'}
                                                            onClick={() => setHeaderMediaSource('asset')}
                                                        >
                                                            Media Assets ({mediaAssets.length})
                                                        </Button>
                                                    )}
                                                    {isDynamicAudience && (
                                                        <Button
                                                            color={headerMediaSource === 'column' ? 'primary' : 'outline-primary'}
                                                            onClick={() => setHeaderMediaSource('column')}
                                                        >
                                                            Bind from {audienceType === 'csv' ? 'CSV' : 'Group'} Column
                                                        </Button>
                                                    )}
                                                </ButtonGroup>
                                            </div>

                                            {headerMediaSource === 'url' && (
                                                <Row className='gy-1'>
                                                    <Col md={headerFormat === 'DOCUMENT' ? 8 : 12}>
                                                        <Label for='header-media-url' className='small fw-bold text-dark'>
                                                            Public {headerFormat} URL (HTTPS) <span className='text-danger'>*</span>
                                                        </Label>
                                                        <Input
                                                            id='header-media-url'
                                                            type='url'
                                                            placeholder={`https://example.com/assets/${headerFormat === 'IMAGE' ? 'banner.png' : headerFormat === 'DOCUMENT' ? 'brochure.pdf' : headerFormat === 'VIDEO' ? 'promo.mp4' : 'audio.mp3'}`}
                                                            value={headerMediaUrl}
                                                            onChange={e => setHeaderMediaUrl(e.target.value)}
                                                        />
                                                    </Col>
                                                    {headerFormat === 'DOCUMENT' && (
                                                        <Col md={4}>
                                                            <Label for='header-doc-filename' className='small fw-bold text-dark'>
                                                                Document Filename (with .pdf)
                                                            </Label>
                                                            <Input
                                                                id='header-doc-filename'
                                                                placeholder='Brochure.pdf'
                                                                value={headerDocumentFilename}
                                                                onChange={e => setHeaderDocumentFilename(e.target.value)}
                                                            />
                                                        </Col>
                                                    )}
                                                </Row>
                                            )}

                                            {headerMediaSource === 'asset' && (
                                                <Row className='gy-1'>
                                                    <Col md={headerFormat === 'DOCUMENT' ? 8 : 12}>
                                                        <Label for='header-media-asset' className='small fw-bold text-dark'>
                                                            Select Media Asset
                                                        </Label>
                                                        <Input
                                                            id='header-media-asset'
                                                            type='select'
                                                            value={headerMediaAssetId}
                                                            onChange={e => {
                                                                const aid = e.target.value
                                                                setHeaderMediaAssetId(aid)
                                                                const asset = mediaAssets.find(a => String(a.id) === aid)
                                                                if (asset?.url) setHeaderMediaUrl(asset.url)
                                                            }}
                                                        >
                                                            <option value=''>-- Choose Uploaded Media Asset --</option>
                                                            {mediaAssets.map((a: any) => (
                                                                <option key={a.id} value={a.id}>
                                                                    {a.name || a.filename || `File #${a.id}`}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </Col>
                                                    {headerFormat === 'DOCUMENT' && (
                                                        <Col md={4}>
                                                            <Label for='header-doc-filename-asset' className='small fw-bold text-dark'>
                                                                Document Filename
                                                            </Label>
                                                            <Input
                                                                id='header-doc-filename-asset'
                                                                value={headerDocumentFilename}
                                                                onChange={e => setHeaderDocumentFilename(e.target.value)}
                                                            />
                                                        </Col>
                                                    )}
                                                </Row>
                                            )}

                                            {headerMediaSource === 'column' && (
                                                <Row className='gy-1'>
                                                    <Col md={headerFormat === 'DOCUMENT' ? 8 : 12}>
                                                        <Label for='header-media-col' className='small fw-bold text-dark'>
                                                            Audience Column with {headerFormat} URL
                                                        </Label>
                                                        <Input
                                                            id='header-media-col'
                                                            type='select'
                                                            value={headerMediaColumn}
                                                            onChange={e => {
                                                                setHeaderMediaColumn(e.target.value)
                                                                const sampleVal = getSampleContactValue(e.target.value, sampleContact)
                                                                if (sampleVal && sampleVal.startsWith('http')) setHeaderMediaUrl(sampleVal)
                                                            }}
                                                        >
                                                            <option value=''>-- Select Column with Media URL --</option>
                                                            {availableColumns.map(c => (
                                                                <option key={c.value} value={c.value}>
                                                                    {c.label} ({c.value})
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </Col>
                                                    {headerFormat === 'DOCUMENT' && (
                                                        <Col md={4}>
                                                            <Label for='header-doc-filename-col' className='small fw-bold text-dark'>
                                                                Document Filename
                                                            </Label>
                                                            <Input
                                                                id='header-doc-filename-col'
                                                                value={headerDocumentFilename}
                                                                onChange={e => setHeaderDocumentFilename(e.target.value)}
                                                            />
                                                        </Col>
                                                    )}
                                                </Row>
                                            )}
                                        </div>
                                    )}

                                    {headerFormat === 'TEXT' && headerComp?.text?.includes('{{1}}') && (
                                        <div className='mt-1'>
                                            <Label for='header-text-param' className='small fw-bold text-dark'>
                                                Header Variable &#123;&#123;1&#125;&#125;
                                            </Label>
                                            <Input
                                                id='header-text-param'
                                                placeholder='e.g. Special Offer or Account Alert'
                                                value={headerTextParam}
                                                onChange={e => setHeaderTextParam(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Col>
                        )}

                        {/* Dynamic Template Parameter Editor */}
                        {selectedTemplate && (
                            <Col md={12}>
                                <div className='border rounded p-2 bg-light'>
                                    <div className='d-flex justify-content-between align-items-center mb-2'>
                                        <div>
                                            <h6 className='fw-bold text-dark mb-0'>Template Variable Values</h6>
                                            <small className='text-muted'>
                                                {detectedVars.length > 0
                                                    ? `Detected ${detectedVars.length} variable placeholder${detectedVars.length > 1 ? 's' : ''} in template text.`
                                                    : 'This template is static and does not contain dynamic variable placeholders.'}
                                            </small>
                                        </div>
                                        {detectedVars.length > 0 && (
                                            <ButtonGroup size='sm'>
                                                <Button
                                                    color={paramMode === 'guided' ? 'primary' : 'outline-primary'}
                                                    onClick={() => setParamMode('guided')}
                                                >
                                                    Guided Fields
                                                </Button>
                                                <Button
                                                    color={paramMode === 'raw' ? 'primary' : 'outline-primary'}
                                                    onClick={() => setParamMode('raw')}
                                                >
                                                    Raw Multi-Line
                                                </Button>
                                            </ButtonGroup>
                                        )}
                                    </div>

                                    {detectedVars.length === 0 ? (
                                        <div className='p-2 bg-white rounded border text-muted small'>
                                            ✓ <strong>No dynamic variables required:</strong> This template will be sent directly to recipients exactly as shown in the preview above.
                                        </div>
                                    ) : isDynamicAudience ? (
                                        <div>
                                            <div className='mb-2 small text-muted'>
                                                Bind each variable placeholder directly to contact columns from your selected {audienceType === 'csv' ? 'CSV file' : 'contact book'}, or enter a fixed text fallback.
                                            </div>
                                            <Row className='gy-2'>
                                                {detectedVars.map(v => {
                                                    const mapping = varMappings[v] || { mode: 'column', column: v === '1' ? 'first_name' : v === '2' ? 'company' : 'name', value: varValues[v] || '' }
                                                    return (
                                                        <Col md={detectedVars.length > 2 ? 6 : 6} key={v}>
                                                            <div className='p-2 bg-white border rounded shadow-xs'>
                                                                <div className='d-flex justify-content-between align-items-center mb-1'>
                                                                    <Label className='fw-bold text-dark small mb-0'>
                                                                        Variable &#123;&#123;{v}&#125;&#125;
                                                                    </Label>
                                                                    <ButtonGroup size='sm'>
                                                                        <Button
                                                                            color={mapping.mode === 'column' ? 'primary' : 'outline-secondary'}
                                                                            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                                                                            onClick={() => handleMappingModeChange(v, 'column')}
                                                                        >
                                                                            {audienceType === 'csv' ? 'CSV Column' : 'Contact Column'}
                                                                        </Button>
                                                                        <Button
                                                                            color={mapping.mode === 'static' ? 'primary' : 'outline-secondary'}
                                                                            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                                                                            onClick={() => handleMappingModeChange(v, 'static')}
                                                                        >
                                                                            Fixed Text
                                                                        </Button>
                                                                    </ButtonGroup>
                                                                </div>

                                                                {mapping.mode === 'column' ? (
                                                                    <div>
                                                                        <Input
                                                                            type='select'
                                                                            bsSize='sm'
                                                                            value={mapping.column}
                                                                            onChange={e => handleMappingColumnChange(v, e.target.value)}
                                                                        >
                                                                            {availableColumns.map(c => (
                                                                                <option key={c.value} value={c.value}>
                                                                                    {c.label} ({c.value})
                                                                                </option>
                                                                            ))}
                                                                        </Input>
                                                                        {sampleContact && (
                                                                            <small className='text-muted d-block mt-1' style={{ fontSize: '0.78rem' }}>
                                                                                Sample: <strong className='text-success'>{getSampleContactValue(mapping.column, sampleContact) || 'N/A'}</strong>
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <Input
                                                                        bsSize='sm'
                                                                        placeholder={`Fixed value for {{${v}}}`}
                                                                        value={varValues[v] || ''}
                                                                        onChange={e => handleVarChange(v, e.target.value)}
                                                                    />
                                                                )}
                                                            </div>
                                                        </Col>
                                                    )
                                                })}
                                            </Row>

                                            {sampleContact && templateBodyText && (
                                                <div className='mt-2 p-2 bg-light-primary rounded border border-primary'>
                                                    <div className='d-flex justify-content-between align-items-center mb-1'>
                                                        <strong className='small text-primary'>
                                                            📱 Real-Time Contact Sample Preview (Row 1: {sampleContact.name || sampleContact.phone || sampleContact['Phone'] || 'Contact'})
                                                        </strong>
                                                        <Badge color='primary' pill>
                                                            {audienceType === 'csv' ? `CSV Source: ${csvFile?.name || 'Uploaded CSV'}` : `Contact Group: ${contactGroups.find(g => String(g.id) === selectedGroup)?.name || 'Custom Book'}`}
                                                        </Badge>
                                                    </div>
                                                    <div className='p-2 bg-white rounded border small' style={{ lineHeight: '1.5' }}>
                                                        {renderTemplateWithValues(templateBodyText, computedSampleVars)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : paramMode === 'guided' ? (
                                        <Row className='gy-2'>
                                            {detectedVars.map(v => (
                                                <Col md={detectedVars.length > 2 ? 4 : 6} key={v}>
                                                    <Label for={`var-${v}`} className='fw-bold text-dark small'>
                                                        Variable &#123;&#123;{v}&#125;&#125;
                                                        {!(varValues[v] || '').trim() && (
                                                            <span className='text-danger ms-1'>*</span>
                                                        )}
                                                    </Label>
                                                    <Input
                                                        id={`var-${v}`}
                                                        placeholder={`Enter value for {{${v}}}`}
                                                        value={varValues[v] || ''}
                                                        onChange={e => handleVarChange(v, e.target.value)}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : (
                                        <div>
                                            <Label for='broadcast-values' className='small fw-bold text-dark'>
                                                Enter one variable value per line (corresponding to {detectedVars.map(v => `{{${v}}}`).join(', ')})
                                            </Label>
                                            <Input
                                                id='broadcast-values'
                                                type='textarea'
                                                rows={detectedVars.length + 1}
                                                placeholder={detectedVars.map(v => `Value for {{${v}}}`).join('\n')}
                                                value={parameters}
                                                onChange={e => handleRawParamChange(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Col>
                        )}

                        <Col md={12}>
                            <div className='d-flex justify-content-between align-items-center mb-1'>
                                <Label className='fw-bold mb-0'>Audience Selection & Destination</Label>
                                <ButtonGroup size='sm'>
                                    <Button
                                        color={audienceType === 'group' ? 'primary' : 'outline-primary'}
                                        onClick={() => setAudienceType('group')}
                                    >
                                        Contact Books / Groups ({contactGroups.length})
                                    </Button>
                                    <Button
                                        color={audienceType === 'csv' ? 'primary' : 'outline-primary'}
                                        onClick={() => setAudienceType('csv')}
                                    >
                                        Direct CSV Upload {csvRows.length > 0 && `(${csvRows.length})`}
                                    </Button>
                                    <Button
                                        color={audienceType === 'manual' ? 'primary' : 'outline-primary'}
                                        onClick={() => setAudienceType('manual')}
                                    >
                                        Manual Numbers / Segments
                                    </Button>
                                </ButtonGroup>
                            </div>

                            {audienceType === 'group' && (
                                <div className='p-2 mb-2 border rounded bg-light'>
                                    <Row className='gy-1 align-items-end'>
                                        <Col md={8}>
                                            <Label for='select-contact-group' className='small fw-bold text-dark'>
                                                Select Uploaded Contact Book / Group
                                            </Label>
                                            <Input
                                                id='select-contact-group'
                                                type='select'
                                                value={selectedGroup}
                                                onChange={e => handleSelectGroup(e.target.value)}
                                            >
                                                <option value=''>-- Choose Contact Group --</option>
                                                {contactGroups.map((g: any) => (
                                                    <option key={g.id} value={g.id}>
                                                        {g.name || g.title || `Group #${g.id}`}
                                                    </option>
                                                ))}
                                            </Input>
                                        </Col>
                                        <Col md={4}>
                                            <div>
                                                {selectedGroup ? (
                                                    <Badge color={groupContacts.length > 0 ? 'light-success' : 'light-warning'}>
                                                        {groupContacts.length} Contact{groupContacts.length === 1 ? '' : 's'} Selected
                                                    </Badge>
                                                ) : (
                                                    <span className='small text-muted'>Pick a group to auto-sync recipients & column mappings</span>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {audienceType === 'csv' && (
                                <div className='p-3 mb-2 border rounded bg-light'>
                                    <input
                                        type='file'
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept='.csv,text/csv'
                                        onChange={e => {
                                            const f = e.target.files?.[0]
                                            if (f) processCsvFile(f)
                                        }}
                                    />
                                    {csvFile && csvRows.length > 0 ? (
                                        <div>
                                            <div className='d-flex justify-content-between align-items-center mb-2'>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <div className='p-2 bg-success text-white rounded'>
                                                        <FileText size={22} />
                                                    </div>
                                                    <div>
                                                        <strong className='d-block text-dark'>{csvFile.name}</strong>
                                                        <small className='text-muted'>
                                                            {(csvFile.size / 1024).toFixed(1)} KB • {csvRows.length.toLocaleString()} records loaded
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className='d-flex gap-1'>
                                                    <Button
                                                        size='sm'
                                                        color='outline-secondary'
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        Replace CSV
                                                    </Button>
                                                    <Button
                                                        size='sm'
                                                        color='outline-danger'
                                                        onClick={() => {
                                                            setCsvFile(null)
                                                            setCsvRows([])
                                                            setCsvPhoneColumn('')
                                                            setRecipients('')
                                                        }}
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                            </div>

                                            <Row className='gy-1 align-items-end'>
                                                <Col md={7}>
                                                    <Label for='csv-phone-col' className='small fw-bold text-dark'>
                                                        Phone Number Column from CSV <span className='text-danger'>*</span>
                                                    </Label>
                                                    <Input
                                                        id='csv-phone-col'
                                                        type='select'
                                                        bsSize='sm'
                                                        value={csvPhoneColumn}
                                                        onChange={e => handleCsvPhoneColumnChange(e.target.value)}
                                                    >
                                                        {availableColumns.map(c => (
                                                            <option key={c.value} value={c.value}>
                                                                {c.label} ({c.value})
                                                            </option>
                                                        ))}
                                                    </Input>
                                                </Col>
                                                <Col md={5}>
                                                    <div className='p-1 bg-white rounded border text-muted small'>
                                                        Extracted: <strong className='text-success'>{recipientCount}</strong> valid phone numbers
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    ) : (
                                        <div
                                            className={`border-2 border-dashed rounded p-4 text-center cursor-pointer transition-all ${isDragging ? 'border-primary bg-light-primary' : 'border-secondary-subtle bg-white'}`}
                                            style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <UploadCloud size={38} className={`mb-2 ${isDragging ? 'text-primary' : 'text-muted'}`} />
                                            <h6 className='fw-bold text-dark mb-1'>Drag & Drop Audience CSV File Here</h6>
                                            <p className='text-muted small mb-2'>
                                                or <span className='text-primary fw-semibold text-decoration-underline'>click to browse your computer</span>
                                            </p>
                                            <small className='text-muted d-block'>
                                                Supported format: <code>.csv</code> with phone numbers and custom columns (e.g. Name, Company, Order ID).
                                            </small>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Label for='broadcast-recipients' className='fw-bold'>
                                Customer Recipient Numbers (E.164 format with country code, comma or newline separated)
                            </Label>
                            <Input
                                id='broadcast-recipients'
                                type='textarea'
                                rows={3}
                                placeholder='+919876543210&#10;+14155552671'
                                value={recipients}
                                onChange={e => setRecipients(e.target.value)}
                            />
                        </Col>

                        <Col md={12}>
                            <div className='d-flex gap-1 align-items-center'>
                                <Input
                                    aria-label='Segment label'
                                    placeholder='Or load from segment label (e.g. VIP, Leads)'
                                    value={segment}
                                    onChange={e => setSegment(e.target.value)}
                                />
                                <Button
                                    disabled={busy || !segment.trim()}
                                    color='outline-secondary'
                                    onClick={() =>
                                        void act(async () => {
                                            const phones = await api(`whatsapp/segments?label=${encodeURIComponent(segment)}`)
                                            setRecipients(phones.join('\n'))
                                            setNotice(`${phones.length} opted-in customers selected from segment.`)
                                        })
                                    }
                                >
                                    Load Segment
                                </Button>
                            </div>
                        </Col>

                        <Col md={6}>
                            <Label for='broadcast-schedule' className='fw-bold'>Schedule Dispatch (Optional)</Label>
                            <Input
                                id='broadcast-schedule'
                                type='datetime-local'
                                value={schedule}
                                onChange={e => setSchedule(e.target.value)}
                            />
                        </Col>

                        {/* Pre-Flight Credit Verification & Category Rate Alert */}
                        {recipientCount > 0 && (
                            <Col md={12} className='mt-2'>
                                {!hasSufficientCredits ? (
                                    <Alert color='danger' className='p-3 mb-2 border border-danger rounded shadow-sm'>
                                        <div className='d-flex align-items-start gap-2'>
                                            <AlertTriangle size={26} className='text-danger flex-shrink-0 mt-1' />
                                            <div className='flex-grow-1'>
                                                <div className='d-flex justify-content-between align-items-center mb-1'>
                                                    <h6 className='fw-bold text-danger mb-0'>
                                                        Insufficient Wallet Credits for Broadcast Dispatch
                                                    </h6>
                                                    <Badge color='danger' pill>Action Required</Badge>
                                                </div>
                                                <p className='small text-dark mb-2'>
                                                    You are attempting to send <strong>{recipientCount.toLocaleString()} {templateCategory}</strong> message{recipientCount === 1 ? '' : 's'}.
                                                    Your available wallet balance is insufficient to cover the required messaging costs.
                                                </p>
                                                <div className='p-2 bg-white rounded border border-danger-subtle d-flex flex-wrap gap-4 small mb-2'>
                                                    <div>
                                                        <span className='text-muted d-block'>Required Credits:</span>
                                                        <strong className='text-danger fs-6'>₹{estimatedCostRupees.toFixed(2)}</strong>
                                                        <span className='text-muted ms-1'>({recipientCount.toLocaleString()} × ₹{unitRate.toFixed(3)})</span>
                                                    </div>
                                                    <div>
                                                        <span className='text-muted d-block'>Available Balance:</span>
                                                        <strong className='text-dark fs-6'>₹{availableBalanceRupees.toFixed(2)}</strong>
                                                    </div>
                                                    <div>
                                                        <span className='text-muted d-block'>Deficit Amount:</span>
                                                        <strong className='text-danger fs-6'>-₹{creditDeficitRupees.toFixed(2)}</strong>
                                                    </div>
                                                    <div>
                                                        <span className='text-muted d-block'>Category Rate:</span>
                                                        <span className='fw-bold text-secondary'>{templateCategory} (₹{unitRate.toFixed(3)}/msg)</span>
                                                    </div>
                                                </div>
                                                <div className='d-flex gap-2 align-items-center'>
                                                    <Button
                                                        color='danger'
                                                        size='sm'
                                                        tag='a'
                                                        href='/wallet'
                                                        target='_blank'
                                                        className='d-inline-flex align-items-center'
                                                    >
                                                        <CreditCard size={14} className='me-1' /> Recharge Wallet
                                                        <ExternalLink size={12} className='ms-1' />
                                                    </Button>
                                                    <small className='text-muted'>
                                                        Broadcast launch is locked until your wallet is recharged.
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </Alert>
                                ) : (
                                    <div className='p-2 mb-2 bg-light-success rounded border border-success d-flex justify-content-between align-items-center'>
                                        <div className='d-flex align-items-center gap-2 small'>
                                            <CheckCircle size={18} className='text-success flex-shrink-0' />
                                            <span>
                                                <strong>Pre-Flight Credit Check Passed:</strong> Estimated cost is <strong>₹{estimatedCostRupees.toFixed(2)}</strong> for {recipientCount.toLocaleString()} {templateCategory} message{recipientCount === 1 ? '' : 's'} (Rate: ₹{unitRate.toFixed(3)}/msg).
                                            </span>
                                        </div>
                                        <Badge color='success' pill>Available: ₹{availableBalanceRupees.toFixed(2)}</Badge>
                                    </div>
                                )}
                            </Col>
                        )}

                        <Col md={12} className='mt-2'>
                            {missingVars.length > 0 && selectedTemplate && (
                                <Alert color='warning' className='py-1 small mb-1'>
                                    ⚠️ Please fill in required variable values for: {missingVars.map(v => `{{${v}}}`).join(', ')}
                                </Alert>
                            )}
                            <Button
                                color='primary'
                                size='lg'
                                disabled={!canSubmit}
                                onClick={() =>
                                    void act(async () => {
                                        const chosen = templates[Number(template)]
                                        const bodyValues = detectedVars.length > 0
                                            ? detectedVars.map(v => {
                                                const mapping = varMappings[v]
                                                if (isDynamicAudience && mapping?.mode === 'column') {
                                                    const sampleVal = getSampleContactValue(mapping.column, sampleContact) || mapping.column
                                                    return { type: 'text', text: sampleVal }
                                                }
                                                return { type: 'text', text: (varValues[v] || '').trim() }
                                            }).filter(p => p.text)
                                            : (parameters.trim() ? parameters.split('\n').map(text => ({ type: 'text', text: text.trim() })).filter(p => p.text) : [])

                                        const components: any[] = []

                                        // 1. Header component (Media or Text)
                                        if (['IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO'].includes(headerFormat)) {
                                            const mediaLink = headerMediaSource === 'url'
                                                ? headerMediaUrl
                                                : headerMediaSource === 'asset'
                                                ? (mediaAssets.find(a => String(a.id) === headerMediaAssetId)?.url || headerMediaUrl)
                                                : (getSampleContactValue(headerMediaColumn, sampleContact) || headerMediaUrl)

                                            if (mediaLink) {
                                                if (headerFormat === 'IMAGE') {
                                                    components.push({
                                                        type: 'header',
                                                        parameters: [{ type: 'image', image: { link: mediaLink } }]
                                                    })
                                                } else if (headerFormat === 'DOCUMENT') {
                                                    components.push({
                                                        type: 'header',
                                                        parameters: [{
                                                            type: 'document',
                                                            document: {
                                                                link: mediaLink,
                                                                filename: headerDocumentFilename || 'Document.pdf'
                                                            }
                                                        }]
                                                    })
                                                } else if (headerFormat === 'VIDEO') {
                                                    components.push({
                                                        type: 'header',
                                                        parameters: [{ type: 'video', video: { link: mediaLink } }]
                                                    })
                                                } else if (headerFormat === 'AUDIO') {
                                                    components.push({
                                                        type: 'header',
                                                        parameters: [{ type: 'audio', audio: { link: mediaLink } }]
                                                    })
                                                }
                                            }
                                        } else if (headerFormat === 'TEXT' && headerTextParam) {
                                            components.push({
                                                type: 'header',
                                                parameters: [{ type: 'text', text: headerTextParam }]
                                            })
                                        }

                                        // 2. Body component
                                        if (bodyValues.length > 0) {
                                            components.push({ type: 'body', parameters: bodyValues })
                                        }

                                        const recipientList = recipients
                                            .split(/[,\n]/)
                                            .map(v => v.trim())
                                            .filter(Boolean)

                                        const result = await api(
                                            'wa-send-message',
                                            'POST',
                                            {
                                                name,
                                                recipients: recipientList,
                                                ...(schedule ? { schedule_at: new Date(schedule).toISOString() } : {}),
                                                payload: {
                                                    phone_number_id: senders.find(s => String(s.id) === sender).phone_number_id,
                                                    template: {
                                                        name: chosen.name,
                                                        language: { code: chosen.language },
                                                        ...(components.length ? { components } : {})
                                                    }
                                                }
                                            },
                                            crypto.randomUUID()
                                        )
                                        await refresh()
                                        setNotice(`Campaign "${name}" (${result.id}) dispatched: status ${result.status}.`)
                                        setName('')
                                        setRecipients('')
                                        setParameters('')
                                        setVarValues({})
                                        setCsvFile(null)
                                        setCsvRows([])
                                        setHeaderMediaUrl('')
                                    })
                                }
                            >
                                {busy ? 'Dispatching Campaign...' : 'Launch Broadcast Campaign'}
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <CardTitle tag='h4'>Opt-In & Marketing Consent Records</CardTitle>
                    <p className='text-muted small'>
                        Record opt-in proof for compliance with Meta WhatsApp Business messaging policy.
                    </p>
                    <Row className='gy-1'>
                        <Col md={4}>
                            <Label for='consent-phone'>Customer Phone (E.164)</Label>
                            <Input
                                id='consent-phone'
                                placeholder='+919876543210'
                                value={consentPhone}
                                onChange={e => setConsentPhone(e.target.value)}
                            />
                        </Col>
                        <Col md={4}>
                            <Label for='consent-source'>Consent Source</Label>
                            <Input
                                id='consent-source'
                                placeholder='Website Checkout / In-store form'
                                value={source}
                                onChange={e => setSource(e.target.value)}
                            />
                        </Col>
                        <Col md={4}>
                            <Label for='consent-choice'>Consent Status</Label>
                            <Input
                                id='consent-choice'
                                type='select'
                                value={String(optedIn)}
                                onChange={e => setOptedIn(e.target.value === 'true')}
                            >
                                <option value='true'>Opted In</option>
                                <option value='false'>Opted Out</option>
                            </Input>
                        </Col>
                        <Col md={12}>
                            <Label for='consent-evidence'>Evidence / Audit Reference</Label>
                            <Input
                                id='consent-evidence'
                                placeholder='Order #9823 checkbox timestamp or sign-up link'
                                value={evidence}
                                onChange={e => setEvidence(e.target.value)}
                            />
                        </Col>
                        <Col md={12}>
                            <Button
                                color='outline-primary'
                                disabled={busy || !consentPhone || source.length < 3 || evidence.length < 3}
                                onClick={() =>
                                    void act(async () => {
                                        await api('whatsapp/consents', 'POST', {
                                            phone: consentPhone,
                                            opted_in: optedIn,
                                            source,
                                            evidence
                                        })
                                        setNotice('Consent recorded with immutable audit history.')
                                        setConsentPhone('')
                                        setSource('')
                                        setEvidence('')
                                    })
                                }
                            >
                                Record Customer Consent
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {policy && (
                <Card>
                    <CardBody>
                        <CardTitle tag='h4'>Broadcast Dispatch Controls</CardTitle>
                        <p className='text-muted small'>
                            {policy.dispatches_today} dispatch slots consumed today. Counter resets at midnight UTC.
                        </p>
                        <Row className='gy-1 align-items-center'>
                            <Col md={4}>
                                <Label for='broadcast-cap'>Daily Dispatch Limit</Label>
                                <Input
                                    id='broadcast-cap'
                                    type='number'
                                    min={1}
                                    max={1000000}
                                    value={policy.daily_limit}
                                    onChange={e => setPolicy({ ...policy, daily_limit: e.target.value })}
                                />
                            </Col>
                            <Col md={4} className='pt-2'>
                                <div className='form-check form-switch'>
                                    <Input
                                        type='switch'
                                        id='approval-switch'
                                        checked={policy.require_approval}
                                        onChange={e => setPolicy({ ...policy, require_approval: e.target.checked })}
                                    />
                                    <Label for='approval-switch' className='form-check-label ms-1'>
                                        Require Administrator Approval
                                    </Label>
                                </div>
                            </Col>
                            <Col md={4} className='d-flex gap-1 pt-2'>
                                <Button color='primary' disabled={busy} onClick={() => void act(() => savePolicy(policy))}>
                                    Save Controls
                                </Button>
                                <Button
                                    color={policy.paused ? 'success' : 'danger'}
                                    disabled={busy}
                                    onClick={() => void act(() => savePolicy({ ...policy, paused: !policy.paused }))}
                                >
                                    {policy.paused ? 'Resume Dispatches' : 'Emergency Pause'}
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            )}

            <Card>
                <CardBody>
                    <div className='d-flex justify-content-between align-items-center mb-1'>
                        <CardTitle tag='h4' className='mb-0'>Campaign History & Analytics</CardTitle>
                        <Button size='sm' color='outline-secondary' disabled={busy} onClick={() => void act(refresh)}>
                            Refresh Campaigns
                        </Button>
                    </div>

                    <Table responsive hover className='align-middle'>
                        <thead>
                            <tr>
                                <th>Campaign Name</th>
                                <th>Status</th>
                                <th>Recipients</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className='text-center text-muted py-2'>
                                        No broadcast campaigns found. Create your first campaign above.
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map(c => (
                                    <tr key={c.id}>
                                        <td className='fw-bold'>{c.name}</td>
                                        <td>
                                            <Badge
                                                color={
                                                    c.status === 'completed'
                                                        ? 'success'
                                                        : c.status === 'processing'
                                                        ? 'primary'
                                                        : c.status === 'pending_approval'
                                                        ? 'warning'
                                                        : c.status === 'cancelled'
                                                        ? 'secondary'
                                                        : 'info'
                                                }
                                            >
                                                {c.status}
                                            </Badge>
                                        </td>
                                        <td>{c.total}</td>
                                        <td>
                                            <Button
                                                size='sm'
                                                color='outline-primary'
                                                className='me-1'
                                                onClick={() => void act(async () => setDetail(await api(`wa-send-message/${c.id}`)))}
                                            >
                                                Delivery Counts
                                            </Button>
                                            {c.status === 'pending_approval' && (
                                                <Button
                                                    size='sm'
                                                    className='me-1'
                                                    color='primary'
                                                    disabled={busy}
                                                    onClick={() =>
                                                        void act(async () => {
                                                            await api(`whatsapp/broadcasts/${c.id}/approve`, 'POST', {})
                                                            await refresh()
                                                        })
                                                    }
                                                >
                                                    Approve
                                                </Button>
                                            )}
                                            {['pending_approval', 'queued', 'processing'].includes(c.status) && (
                                                <Button
                                                    size='sm'
                                                    color='danger'
                                                    outline
                                                    disabled={busy}
                                                    onClick={() =>
                                                        void act(async () => {
                                                            await api('change-campaign-status-to-stop', 'POST', { campaign_id: c.id })
                                                            await refresh()
                                                        })
                                                    }
                                                >
                                                    Cancel Unsent
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>

                    {detail && (
                        <Alert color='info' className='mt-2 d-flex justify-content-between align-items-center'>
                            <div>
                                <strong>{detail.name} Status Breakdown:</strong>{' '}
                                {detail.counts &&
                                    Object.entries(detail.counts)
                                        .map(([status, count]) => `${status}: ${count}`)
                                        .join(' · ')}
                            </div>
                            <Button size='sm' color='close' onClick={() => setDetail(null)} />
                        </Alert>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}
