import React, { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap'
import { RefreshCw, CheckCircle, AlertCircle, FileText } from 'react-feather'
import { whatsappService, WhatsAppConnection } from '../../../../services/whatsappService'
import { SuccessToast, ErrorToast } from '../../../../utility/Utils'

interface ReReviewModalProps {
    connection: WhatsAppConnection | null
    isOpen: boolean
    toggle: () => void
    onSuccess?: () => void
}

export const ReReviewModal: React.FC<ReReviewModalProps> = ({
    connection,
    isOpen,
    toggle,
    onSuccess
}) => {
    const [newName, setNewName] = useState(connection?.verified_name || connection?.name || 'KRAD Technology')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!connection?.id) return
        if (!newName.trim() || newName.trim().length < 2) {
            setError('Please enter a valid business display name (minimum 2 characters).')
            return
        }

        setSubmitting(true)
        setError('')
        try {
            const res = await whatsappService.resubmitDisplayName(connection.id, newName.trim())
            SuccessToast(res.message || 'Display name resubmitted to Meta for re-review!')
            if (onSuccess) onSuccess()
            toggle()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Could not submit display name revision'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered className="modal-dialog-centered">
            <ModalHeader toggle={toggle} className="border-bottom pb-2">
                <div className="d-flex align-items-center gap-1">
                    <RefreshCw className="text-primary" size={18} />
                    <span className="fw-bolder fs-5 text-dark">Resubmit Display Name for Meta Review</span>
                </div>
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
                <ModalBody className="py-3">
                    {error && <Alert color="danger" className="p-2 mb-3">{error}</Alert>}

                    <div className="p-2 rounded-2 mb-3 bg-light border">
                        <div className="small text-muted">Phone Number:</div>
                        <div className="fw-bold font-monospace text-dark">{connection?.display_phone_number || connection?.phone_number_id}</div>
                    </div>

                    <FormGroup className="mb-3">
                        <Label for="revisedName" className="form-label fw-bold text-dark">
                            Revised Brand Display Name *
                        </Label>
                        <Input
                            id="revisedName"
                            type="text"
                            required
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. KRAD Technology Pvt Ltd"
                            style={{ borderRadius: '6px' }}
                        />
                        <small className="text-muted d-block mt-1">
                            Must match your business documents, website, or trademark filings.
                        </small>
                    </FormGroup>

                    <div className="p-2 rounded-2 bg-light-primary text-primary small d-flex gap-2 align-items-start">
                        <FileText size={18} className="flex-shrink-0 mt-1" />
                        <div>
                            <strong>Meta Compliance Guidelines:</strong>
                            <ul className="mb-0 ps-3 mt-1 text-muted">
                                <li>Use consistent capitalization (avoid all-caps or all-lowercase).</li>
                                <li>Do not add extraneous words, emojis, or punctuation.</li>
                                <li>Ensure business details are verifiable in your Meta Business Portfolio.</li>
                            </ul>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="border-top pt-2">
                    <Button color="secondary" outline type="button" onClick={toggle} size="sm">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21', color: '#fff' }}
                        size="sm"
                        className="fw-semibold"
                    >
                        {submitting ? 'Submitting to Meta...' : 'Resubmit Name for Review'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    )
}

export default ReReviewModal

