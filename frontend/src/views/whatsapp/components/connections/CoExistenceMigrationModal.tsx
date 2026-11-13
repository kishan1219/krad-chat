import React, { useState } from 'react'
import {
    Smartphone,
    Phone,
    CheckCircle,
    UploadCloud,
    X
} from 'react-feather'
import {
    Modal,
    ModalHeader,
    ModalBody,
    Row,
    Col,
    FormGroup,
    Label,
    Input,
    Button,
    Card,
    CardBody,
    Alert
} from 'reactstrap'
import {
    whatsappService,
    WhatsAppConnection,
    ChatHistorySyncResult
} from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface CoExistenceMigrationModalProps {
    connection: WhatsAppConnection | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CoExistenceMigrationModal({
    connection,
    isOpen,
    onClose,
    onSuccess
}: CoExistenceMigrationModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [codeMethod, setCodeMethod] = useState<'SMS' | 'VOICE'>('SMS')
    const [otpCode, setOtpCode] = useState('')
    const [requestingCode, setRequestingCode] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [syncResult, setSyncResult] = useState<ChatHistorySyncResult | null>(null)
    const [uploadedFileName, setUploadedFileName] = useState('')
    const [error, setError] = useState('')

    if (!isOpen || !connection) return null

    const handleRequestCode = async () => {
        setRequestingCode(true)
        setError('')
        try {
            await whatsappService.requestCode(connection.id, { code_method: codeMethod })
            SuccessToast(`6-digit verification code sent via ${codeMethod}!`)
            setStep(2)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to request verification code'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setRequestingCode(false)
        }
    }

    const handleVerifyPin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otpCode.length < 6) return
        setVerifying(true)
        setError('')
        try {
            await whatsappService.registerNumber(connection.id, otpCode)
            SuccessToast('Phone number successfully registered on WhatsApp Cloud API!')
            setStep(3)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'PIN Verification failed'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setVerifying(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadedFileName(file.name)
        setSyncing(true)
        setError('')
        const isZip = file.name.endsWith('.zip')
        const reader = new FileReader()

        reader.onload = async (evt) => {
            try {
                const content = evt.target?.result as string
                const payload = isZip
                    ? { content_base64: content.includes(',') ? content.split(',')[1] : content, filename: file.name }
                    : { raw_text: content, filename: file.name }

                const res = await whatsappService.syncChatHistory(connection.id, payload)
                setSyncResult(res)
                SuccessToast(`Successfully synced ${res.imported_count} messages into Cloud API Inbox!`)
                onSuccess()
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Chat sync failed'
                setError(msg)
                ErrorToast(msg)
            } finally {
                setSyncing(false)
            }
        }

        if (isZip) reader.readAsDataURL(file)
        else reader.readAsText(file)
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
                        <Smartphone size={18} />
                    </div>
                    <div>
                        <span className="fw-bolder" style={{ color: '#5e5873', fontSize: '1.1rem' }}>
                            Embedded Co-Existence Migration
                        </span>
                        <div className="small text-muted font-monospace" style={{ fontSize: '0.78rem' }}>
                            {connection.display_phone_number || connection.phone_number_id}
                        </div>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="p-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                {error && <Alert color="danger" className="p-1 mb-2 small">{error}</Alert>}

                {step === 1 && (
                    <div>
                        <h6 className="fw-bolder mb-1">Step 1: Request Registration OTP</h6>
                        <p className="text-muted small mb-2">
                            Meta requires 2FA ownership verification to migrate your existing WhatsApp Business app line.
                        </p>
                        <FormGroup className="mb-2">
                            <Label className="small fw-bold">Verification Channel</Label>
                            <div className="d-flex gap-2">
                                <Button
                                    size="sm"
                                    color={codeMethod === 'SMS' ? 'primary' : 'secondary'}
                                    outline={codeMethod !== 'SMS'}
                                    onClick={() => setCodeMethod('SMS')}
                                    style={codeMethod === 'SMS' ? { backgroundColor: '#ff8c21', borderColor: '#ff8c21' } : {}}
                                >
                                    SMS Verification
                                </Button>
                                <Button
                                    size="sm"
                                    color={codeMethod === 'VOICE' ? 'primary' : 'secondary'}
                                    outline={codeMethod !== 'VOICE'}
                                    onClick={() => setCodeMethod('VOICE')}
                                    style={codeMethod === 'VOICE' ? { backgroundColor: '#ff8c21', borderColor: '#ff8c21' } : {}}
                                >
                                    Voice Call
                                </Button>
                            </div>
                        </FormGroup>

                        <div className="d-flex justify-content-end gap-1 pt-1 border-top">
                            <Button color="secondary" outline onClick={onClose}>Cancel</Button>
                            <Button
                                disabled={requestingCode}
                                onClick={handleRequestCode}
                                style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff', fontWeight: 600 }}
                            >
                                {requestingCode ? 'Requesting...' : 'Send Verification OTP'}
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyPin}>
                        <h6 className="fw-bolder mb-1">Step 2: Enter 6-Digit Meta PIN</h6>
                        <p className="text-muted small mb-2">
                            Enter the code sent to {connection.display_phone_number} via {codeMethod}.
                        </p>
                        <FormGroup className="mb-2">
                            <Input
                                required
                                maxLength={6}
                                value={otpCode}
                                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                className="text-center font-monospace"
                                style={{ letterSpacing: '8px', fontSize: '1.25rem', maxWidth: '240px', margin: '0 auto' }}
                            />
                        </FormGroup>

                        <div className="d-flex justify-content-between align-items-center pt-1 border-top">
                            <Button color="link" size="sm" onClick={() => setStep(1)} className="text-muted">Back</Button>
                            <Button
                                type="submit"
                                disabled={verifying || otpCode.length < 6}
                                style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff', fontWeight: 600 }}
                            >
                                {verifying ? 'Verifying...' : 'Register Number'}
                            </Button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div>
                        <div className="d-flex align-items-center gap-1 mb-2 text-success">
                            <CheckCircle size={24} />
                            <h6 className="fw-bolder mb-0 text-success">Line Registered on Cloud API!</h6>
                        </div>

                        <div className="border border-dashed rounded p-3 text-center mb-2" style={{ backgroundColor: '#fafafc' }}>
                            <UploadCloud size={32} style={{ color: '#ff8c21' }} className="mb-1" />
                            <h6 className="fw-bolder mb-50">Upload Chat History (.zip or .txt)</h6>
                            <p className="text-muted small mb-2">
                                Export chats from WhatsApp Business app and upload here to retain customer conversation threads.
                            </p>
                            <label className="btn btn-sm text-white" style={{ backgroundColor: '#ff8c21', cursor: 'pointer' }}>
                                <span>{syncing ? 'Ingesting Chat History...' : 'Upload Backup File'}</span>
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
                                • Successfully imported: {syncResult.imported_count} messages<br />
                                • Conversations preserved: {syncResult.conversations_count} customer threads
                            </Alert>
                        )}

                        <div className="d-flex justify-content-end pt-1 border-top mt-2">
                            <Button color="secondary" onClick={onClose}>Done</Button>
                        </div>
                    </div>
                )}
            </ModalBody>
        </Modal>
    )
}
