import React, { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label, Alert, Badge } from 'reactstrap'
import { FilePlus } from 'react-feather'
import { WhatsAppConnection, whatsappService } from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface CreateTemplateModalProps {
    connection: WhatsAppConnection | null
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void | Promise<void>
}

export function CreateTemplateModal({ connection, isOpen, onClose, onSuccess }: CreateTemplateModalProps) {
    const [name, setName] = useState('')
    const [language, setLanguage] = useState('en_US')
    const [category, setCategory] = useState<'UTILITY' | 'MARKETING'>('UTILITY')
    const [header, setHeader] = useState('')
    const [text, setText] = useState('')
    const [examples, setExamples] = useState('')
    const [footer, setFooter] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setError('')
            setBusy(false)
        }
    }, [isOpen])

    if (!connection) return null

    const placeholderCount = new Set(Array.from(text.matchAll(/\{\{(\d+)\}\}/g)).map(m => Number(m[1]))).size

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const normalizedName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
        if (!/^[a-z][a-z0-9_]{0,511}$/.test(normalizedName)) {
            setError('Template name must start with a lowercase letter and use only lowercase letters, numbers, and underscores.')
            return
        }

        const exampleList = examples.trim()
            ? examples.split('\n').map(v => v.trim()).filter(Boolean)
            : []

        if (placeholderCount > 0 && exampleList.length !== placeholderCount) {
            setError(`Please provide ${placeholderCount} example value(s), one per line, matching {{1}}..{{${placeholderCount}}}.`)
            return
        }

        setBusy(true)
        try {
            const res = await whatsappService.createTemplate(connection.id, {
                name: normalizedName,
                language: language.trim(),
                category,
                text: text.trim(),
                examples: exampleList,
                header: header.trim(),
                footer: footer.trim()
            })
            SuccessToast(`Template '${res.name}' submitted to Meta (Status: ${res.status}, ID: ${res.id}).`)
            setName('')
            setHeader('')
            setText('')
            setExamples('')
            setFooter('')
            if (onSuccess) await Promise.resolve(onSuccess())
            onClose()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to create Meta WhatsApp template'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setBusy(false)
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={onClose} centered size="md">
            <ModalHeader toggle={onClose} className="border-bottom pb-2">
                <div className="d-flex align-items-center gap-2">
                    <FilePlus size={18} style={{ color: '#ff8c21' }} />
                    <span className="fw-bolder">Create WhatsApp Message Template</span>
                </div>
            </ModalHeader>
            <form onSubmit={handleSubmit}>
                <ModalBody className="p-3">
                    <div className="p-2 rounded-2 bg-light border mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div className="small">
                            <span className="fw-bold text-dark">{connection.verified_name || connection.name}</span>
                            <span className="text-muted ms-2">{connection.display_phone_number || connection.phone_number_id}</span>
                        </div>
                        <Badge color="light-info" className="text-info">WABA: {connection.waba_id}</Badge>
                    </div>

                    {error && <Alert color="danger" className="p-2 small mb-3">{error}</Alert>}

                    <div className="row g-2 mb-2">
                        <div className="col-sm-7">
                            <Label for="tpl-name" className="form-label small fw-semibold">Template Name</Label>
                            <Input
                                id="tpl-name"
                                placeholder="e.g. order_confirmation"
                                value={name}
                                onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                required
                            />
                            <small className="text-muted" style={{ fontSize: '0.72rem' }}>Lowercase letters, numbers, underscores only.</small>
                        </div>
                        <div className="col-sm-5">
                            <Label for="tpl-lang" className="form-label small fw-semibold">Language</Label>
                            <Input id="tpl-lang" type="select" value={language} onChange={e => setLanguage(e.target.value)}>
                                <option value="en_US">English (US) - en_US</option>
                                <option value="en">English - en</option>
                                <option value="hi">Hindi - hi</option>
                            </Input>
                        </div>
                    </div>

                    <div className="mb-2">
                        <Label for="tpl-cat" className="form-label small fw-semibold">Category</Label>
                        <Input id="tpl-cat" type="select" value={category} onChange={e => setCategory(e.target.value as 'UTILITY' | 'MARKETING')}>
                            <option value="UTILITY">UTILITY (Order updates, alerts, confirmations)</option>
                            <option value="MARKETING">MARKETING (Promotions, offers, announcements)</option>
                        </Input>
                    </div>

                    <div className="mb-2">
                        <Label for="tpl-header" className="form-label small fw-semibold">Header (Optional, static text)</Label>
                        <Input
                            id="tpl-header"
                            maxLength={60}
                            placeholder="e.g. Order Update"
                            value={header}
                            onChange={e => setHeader(e.target.value)}
                        />
                    </div>

                    <div className="mb-2">
                        <Label for="tpl-body" className="form-label small fw-semibold">Message Body</Label>
                        <Input
                            id="tpl-body"
                            type="textarea"
                            rows={3}
                            maxLength={1024}
                            placeholder="Hello {{1}}, your order {{2}} has been confirmed."
                            value={text}
                            onChange={e => setText(e.target.value)}
                            required
                        />
                    </div>

                    {placeholderCount > 0 && (
                        <div className="mb-2">
                            <Label for="tpl-examples" className="form-label small fw-semibold">
                                Placeholder Examples ({placeholderCount} required, one per line)
                            </Label>
                            <Input
                                id="tpl-examples"
                                type="textarea"
                                rows={Math.min(4, placeholderCount)}
                                placeholder={Array.from({ length: placeholderCount }, (_, i) => `Sample value ${i + 1}`).join('\n')}
                                value={examples}
                                onChange={e => setExamples(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="mb-1">
                        <Label for="tpl-footer" className="form-label small fw-semibold">Footer (Optional, static text)</Label>
                        <Input
                            id="tpl-footer"
                            maxLength={60}
                            placeholder="e.g. Thank you for choosing KRAD Technology"
                            value={footer}
                            onChange={e => setFooter(e.target.value)}
                        />
                    </div>
                </ModalBody>
                <ModalFooter className="border-top pt-2">
                    <Button type="button" color="light" size="sm" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={busy || !name.trim() || !text.trim() || connection.status !== 'connected'}
                        style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#ffffff', fontWeight: 600 }}
                    >
                        {busy ? 'Submitting to Meta...' : 'Submit Template to Meta'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    )
}
