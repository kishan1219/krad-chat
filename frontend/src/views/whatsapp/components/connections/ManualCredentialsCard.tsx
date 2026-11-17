import React, { useState } from 'react'
import { Card, CardBody, Row, Col, Input, Label, Button, Alert } from 'reactstrap'
import { Key, Zap, CheckCircle, X } from 'react-feather'
import { whatsappService, CreateConnectionPayload } from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface ManualCredentialsCardProps {
    onSuccess: () => void
    onClose: () => void
}

export function ManualCredentialsCard({ onSuccess, onClose }: ManualCredentialsCardProps) {
    const [name, setName] = useState('')
    const [wabaId, setWabaId] = useState('')
    const [phoneNumberId, setPhoneNumberId] = useState('')
    const [displayNumber, setDisplayNumber] = useState('')
    const [token, setToken] = useState('')
    const [busy, setBusy] = useState(false)
    const [detecting, setDetecting] = useState(false)
    const [detectedInfo, setDetectedInfo] = useState<string | null>(null)
    const [error, setError] = useState('')

    const handleAutoDetect = async () => {
        if (!token.trim()) {
            setError('Please paste your Meta System User Access Token first to auto-detect.')
            return
        }
        setDetecting(true)
        setError('')
        setDetectedInfo(null)
        try {
            const res = await whatsappService.detectWaba(token.trim())
            if (res.waba_id) {
                setWabaId(res.waba_id)
                if (!name && res.waba_name) {
                    setName('Krad Technology')
                }
            }
            if (res.phone_numbers && res.phone_numbers.length > 0) {
                const p = res.phone_numbers[0]
                setPhoneNumberId(p.id)
                if (p.display_phone_number) setDisplayNumber(p.display_phone_number)
                if (p.verified_name) setName(p.verified_name)
                setDetectedInfo(`Found WABA ${res.waba_id} (${res.waba_name || 'Krad Technology'}) with number ${p.display_phone_number || p.id}`)
            } else {
                setDetectedInfo(`Found WABA ${res.waba_id} (${res.waba_name || 'Krad Technology'}). Enter your Phone Number ID below.`)
            }
            SuccessToast('Meta WABA details auto-detected successfully!')
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Could not auto-detect WABA. Please enter IDs manually.'
            setError(msg)
        } finally {
            setDetecting(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!wabaId.trim() || !phoneNumberId.trim() || !token.trim()) {
            setError('WABA ID, Phone Number ID, and System User Token are required.')
            return
        }

        setBusy(true)
        setError('')
        try {
            const payload: CreateConnectionPayload = {
                name: name.trim() || 'Krad Technology',
                waba_id: wabaId.trim(),
                phone_number_id: phoneNumberId.trim(),
                display_phone_number: displayNumber.trim() || undefined,
                access_token: token.trim()
            }
            await whatsappService.createConnection(payload)
            SuccessToast('WhatsApp connection established with Krad Technology!')
            onSuccess()
            onClose()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to connect WhatsApp line'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setBusy(false)
        }
    }

    return (
        <Card className="border mb-3 shadow-none rounded-3" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
            <CardBody className="p-3">
                <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '36px',
                                height: '36px',
                                backgroundColor: '#fff7ed',
                                color: '#ff8c21'
                            }}
                        >
                            <Key size={18} />
                        </div>
                        <div>
                            <h6 className="fw-bolder mb-0 text-dark" style={{ fontSize: '0.95rem' }}>
                                Manual Meta Cloud API Credentials
                            </h6>
                            <small className="text-muted">
                                Direct connection using permanent System User Access Token
                            </small>
                        </div>
                    </div>
                    <Button
                        color="link"
                        size="sm"
                        className="p-1 text-muted"
                        onClick={onClose}
                        title="Close Form"
                    >
                        <X size={18} />
                    </Button>
                </div>

                {error && (
                    <Alert color="danger" className="p-2 mb-2 rounded-2" style={{ fontSize: '0.82rem' }}>
                        {error}
                    </Alert>
                )}

                {detectedInfo && (
                    <Alert color="success" className="p-2 mb-2 rounded-2 d-flex align-items-center gap-1" style={{ fontSize: '0.82rem' }}>
                        <CheckCircle size={15} className="shrink-0" />
                        <span>{detectedInfo}</span>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Row className="g-2">
                        <Col xs="12">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <Label className="small mb-0 fw-bold text-dark">
                                    Meta Permanent Access Token *
                                </Label>
                                <button
                                    type="button"
                                    onClick={handleAutoDetect}
                                    disabled={detecting || !token.trim()}
                                    className="btn btn-link btn-sm p-0 d-inline-flex align-items-center gap-1 text-decoration-none fw-semibold"
                                    style={{ color: '#ff8c21', fontSize: '0.78rem' }}
                                >
                                    <Zap size={12} />
                                    <span>{detecting ? 'Auto-Detecting...' : 'Auto-Detect WABA & Numbers'}</span>
                                </button>
                            </div>
                            <Input
                                type="password"
                                required
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="e.g. EAAG... (System User Permanent Token)"
                                bsSize="sm"
                            />
                        </Col>
                        <Col xs="12" sm="6">
                            <Label className="small mb-1 fw-bold text-dark">Display Name</Label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Krad Technology"
                                bsSize="sm"
                            />
                        </Col>
                        <Col xs="12" sm="6">
                            <Label className="small mb-1 fw-bold text-dark">Display Phone Number</Label>
                            <Input
                                type="text"
                                value={displayNumber}
                                onChange={(e) => setDisplayNumber(e.target.value)}
                                placeholder="e.g. +91 98765 43210"
                                bsSize="sm"
                            />
                        </Col>
                        <Col xs="12" sm="6">
                            <Label className="small mb-1 fw-bold text-dark">WhatsApp Business Account (WABA) ID *</Label>
                            <Input
                                type="text"
                                name="manual_waba_account_id"
                                autoComplete="off"
                                inputMode="numeric"
                                required
                                value={wabaId}
                                onChange={(e) => setWabaId(e.target.value.replace(/[^\d]/g, ''))}
                                placeholder="e.g. 109876543210987"
                                bsSize="sm"
                            />
                        </Col>
                        <Col xs="12" sm="6">
                            <Label className="small mb-1 fw-bold text-dark">Phone Number ID *</Label>
                            <Input
                                type="text"
                                name="manual_phone_number_id"
                                autoComplete="off"
                                inputMode="numeric"
                                required
                                value={phoneNumberId}
                                onChange={(e) => setPhoneNumberId(e.target.value.replace(/[^\d]/g, ''))}
                                placeholder="e.g. 105592837482"
                                bsSize="sm"
                            />
                        </Col>
                        <Col xs="12" className="d-flex justify-content-end gap-2 mt-2 pt-2 border-top">
                            <Button
                                type="button"
                                size="sm"
                                color="secondary"
                                outline
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={busy}
                                style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#ffffff' }}
                                className="fw-semibold"
                            >
                                {busy ? 'Connecting...' : 'Establish Connection'}
                            </Button>
                        </Col>
                    </Row>
                </form>
            </CardBody>
        </Card>
    )
}
export default ManualCredentialsCard
