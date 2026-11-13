import React, { useEffect, useState } from 'react'
import {
    Repeat,
    Clock,
    UploadCloud,
    CheckCircle,
    Calendar,
    RefreshCw,
    X
} from 'react-feather'
import {
    Modal,
    ModalHeader,
    ModalBody,
    Nav,
    NavItem,
    NavLink,
    Row,
    Col,
    FormGroup,
    Label,
    Input,
    Button,
    Card,
    CardBody,
    Badge,
    Alert
} from 'reactstrap'
import {
    whatsappService,
    WhatsAppConnection,
    IncrementalSyncResult,
    SyncScheduleResult
} from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface IncrementalSyncModalProps {
    connection: WhatsAppConnection | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function IncrementalSyncModal({
    connection,
    isOpen,
    onClose,
    onSuccess
}: IncrementalSyncModalProps) {
    const [tab, setTab] = useState<'incremental' | 'schedule'>('incremental')
    const [schedule, setSchedule] = useState<SyncScheduleResult | null>(null)
    const [pollEnabled, setPollEnabled] = useState(false)
    const [intervalHours, setIntervalHours] = useState(6)
    const [syncing, setSyncing] = useState(false)
    const [savingSchedule, setSavingSchedule] = useState(false)
    const [syncResult, setSyncResult] = useState<IncrementalSyncResult | null>(null)

    const fetchSchedule = async () => {
        if (!connection) return
        try {
            const data = await whatsappService.getSyncSchedule(connection.id)
            setSchedule(data)
            setPollEnabled(data.sync_schedule?.poll_enabled || false)
            setIntervalHours(data.sync_schedule?.poll_interval_hours || 6)
        } catch {
            // handle error
        }
    }

    useEffect(() => {
        if (isOpen && connection) {
            fetchSchedule()
            setSyncResult(null)
        }
    }, [isOpen, connection])

    if (!isOpen || !connection) return null

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setSyncing(true)
        const isZip = file.name.endsWith('.zip')
        const reader = new FileReader()

        reader.onload = async (evt) => {
            try {
                const content = evt.target?.result as string
                const payload = isZip
                    ? { content_base64: content.includes(',') ? content.split(',')[1] : content, filename: file.name }
                    : { raw_text: content, filename: file.name }

                const res = await whatsappService.syncIncrementalChatHistory(connection.id, payload)
                setSyncResult(res)
                SuccessToast(`Ingested ${res.imported_count} new messages (${res.skipped_count} skipped as existing)`)
                await fetchSchedule()
                onSuccess()
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Incremental sync failed'
                ErrorToast(msg)
            } finally {
                setSyncing(false)
            }
        }

        if (isZip) reader.readAsDataURL(file)
        else reader.readAsText(file)
    }

    const handlePollNow = async () => {
        setSyncing(true)
        try {
            const res = await whatsappService.syncIncrementalChatHistory(connection.id, { simulated_poll: true })
            setSyncResult(res)
            SuccessToast(`Polling finished: ${res.imported_count} new messages ingested.`)
            await fetchSchedule()
            onSuccess()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Polling sync failed'
            ErrorToast(msg)
        } finally {
            setSyncing(false)
        }
    }

    const handleSaveSchedule = async () => {
        setSavingSchedule(true)
        try {
            await whatsappService.updateSyncSchedule(connection.id, {
                poll_enabled: pollEnabled,
                poll_interval_hours: intervalHours
            })
            SuccessToast('Periodic polling schedule updated!')
            await fetchSchedule()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to save schedule'
            ErrorToast(msg)
        } finally {
            setSavingSchedule(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={onClose}
            centered
            size="lg"
            className="modal-dialog-centered"
            contentClassName="rounded-3 shadow-lg border-0"
        >
            <ModalHeader
                toggle={onClose}
                className="border-bottom py-1"
                close={
                    <Button color="link" size="sm" className="p-50 text-muted" onClick={onClose}>
                        <X size={20} />
                    </Button>
                }
            >
                <div className="d-flex align-items-center gap-1">
                    <div
                        className="d-flex align-items-center justify-content-center p-50 rounded"
                        style={{ backgroundColor: '#fff4eb', color: '#ff8c21' }}
                    >
                        <Repeat size={18} />
                    </div>
                    <div>
                        <span className="fw-bolder" style={{ color: '#5e5873', fontSize: '1.1rem' }}>
                            Co-Existence Incremental Sync
                        </span>
                        <div className="small text-muted font-monospace" style={{ fontSize: '0.78rem' }}>
                            {connection.display_phone_number || connection.phone_number_id}
                        </div>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="p-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <Nav tabs className="mb-2">
                    <NavItem>
                        <NavLink
                            active={tab === 'incremental'}
                            onClick={() => setTab('incremental')}
                            className="cursor-pointer"
                            style={{
                                color: tab === 'incremental' ? '#ff8c21' : '#6e6b7b',
                                borderBottom: tab === 'incremental' ? '2px solid #ff8c21' : 'none',
                                fontWeight: tab === 'incremental' ? 600 : 400
                            }}
                        >
                            Upload Subsequent Backup
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            active={tab === 'schedule'}
                            onClick={() => setTab('schedule')}
                            className="cursor-pointer"
                            style={{
                                color: tab === 'schedule' ? '#ff8c21' : '#6e6b7b',
                                borderBottom: tab === 'schedule' ? '2px solid #ff8c21' : 'none',
                                fontWeight: tab === 'schedule' ? 600 : 400
                            }}
                        >
                            Scheduled Background Polling
                        </NavLink>
                    </NavItem>
                </Nav>

                {/* Watermark Status Card */}
                <Card className="border mb-2 shadow-none" style={{ backgroundColor: '#f8f9fa' }}>
                    <CardBody className="p-1">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="small text-muted">Sync Watermark:</span>{' '}
                                <strong className="small">
                                    {schedule?.sync_watermark
                                        ? new Date(schedule.sync_watermark).toLocaleString()
                                        : 'Initial sync pending'}
                                </strong>
                            </div>
                            <Badge color="light-primary" pill>
                                Ingested Count: {schedule?.incremental_sync_count ?? 0}
                            </Badge>
                        </div>
                    </CardBody>
                </Card>

                {tab === 'incremental' && (
                    <div>
                        <div
                            className="border border-dashed rounded p-3 text-center mb-2"
                            style={{ borderColor: '#d8d6de', backgroundColor: '#fafafc' }}
                        >
                            <UploadCloud size={32} style={{ color: '#ff8c21' }} className="mb-1" />
                            <h6 className="fw-bolder mb-50">Upload Newer Chat Export File (.zip or .txt)</h6>
                            <p className="text-muted small mb-2">
                                Older messages before the watermark timestamp will be skipped automatically to prevent duplicates.
                            </p>
                            <label className="btn btn-sm text-white" style={{ backgroundColor: '#ff8c21', cursor: 'pointer' }}>
                                <span>{syncing ? 'Ingesting Messages...' : 'Select Chat File'}</span>
                                <input
                                    type="file"
                                    accept=".zip,.txt"
                                    onChange={handleFileUpload}
                                    disabled={syncing}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {syncResult && (
                            <Alert color="success" className="p-1 mb-0 small">
                                <div className="fw-bold mb-25">Incremental Sync Complete!</div>
                                <div>• Newly imported: {syncResult.imported_count} messages</div>
                                <div>• Skipped duplicates: {syncResult.skipped_count} messages</div>
                                <div>• Updated watermark: {new Date(syncResult.watermark).toLocaleString()}</div>
                            </Alert>
                        )}
                    </div>
                )}

                {tab === 'schedule' && (
                    <div>
                        <div className="form-check form-switch mb-2">
                            <Input
                                type="checkbox"
                                id="pollEnabledSwitch"
                                checked={pollEnabled}
                                onChange={e => setPollEnabled(e.target.checked)}
                            />
                            <Label for="pollEnabledSwitch" className="form-check-label fw-bold ms-50">
                                Enable Automated Periodic Polling
                            </Label>
                        </div>

                        <FormGroup className="mb-2">
                            <Label className="small fw-bold">Polling Interval (Hours)</Label>
                            <Input
                                type="select"
                                value={intervalHours}
                                onChange={e => setIntervalHours(Number(e.target.value))}
                                disabled={!pollEnabled}
                            >
                                <option value={1}>Every 1 hour</option>
                                <option value={3}>Every 3 hours</option>
                                <option value={6}>Every 6 hours (Recommended)</option>
                                <option value={12}>Every 12 hours</option>
                                <option value={24}>Once daily (24 hours)</option>
                            </Input>
                        </FormGroup>

                        <div className="d-flex justify-content-between align-items-center pt-1 border-top">
                            <Button
                                size="sm"
                                color="secondary"
                                outline
                                disabled={syncing}
                                onClick={handlePollNow}
                            >
                                <RefreshCw size={14} className={`me-50 ${syncing ? 'animate-spin' : ''}`} />
                                <span>Poll Now</span>
                            </Button>
                            <Button
                                size="sm"
                                disabled={savingSchedule}
                                onClick={handleSaveSchedule}
                                style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff', fontWeight: 600 }}
                            >
                                {savingSchedule ? 'Saving...' : 'Save Polling Policy'}
                            </Button>
                        </div>
                    </div>
                )}
            </ModalBody>
        </Modal>
    )
}
