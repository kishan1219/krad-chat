import React, { useState, useEffect } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Alert,
    Spinner,
    Badge
} from 'reactstrap'
import { RotateCcw, AlertCircle } from 'react-feather'
import { whatsappService } from '../../../services/whatsappService'

interface RefundModalProps {
    isOpen: boolean
    toggle: () => void
    transaction: {
        id?: number | string
        reference_id: string
        transaction_id: string
        amount_paise: number
        currency: string
        refunded_amount_paise?: number
    } | null
    onRefundSuccess: (updatedTx: any) => void
}

const RefundModal: React.FC<RefundModalProps> = ({
    isOpen,
    toggle,
    transaction,
    onRefundSuccess
}) => {
    if (!transaction) return null

    const totalPaise = Number(transaction.amount_paise) || 0
    const alreadyRefundedPaise = Number(transaction.refunded_amount_paise) || 0
    const remainingPaise = Math.max(0, totalPaise - alreadyRefundedPaise)
    const remainingAmount = (remainingPaise / 100).toFixed(2)

    const [refundType, setRefundType] = useState<'full' | 'partial'>('full')
    const [amountText, setAmountText] = useState(remainingAmount)
    const [reason, setReason] = useState('Customer requested refund')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setAmountText(remainingAmount)
        setRefundType('full')
        setError(null)
    }, [isOpen, remainingAmount])

    const handleTypeChange = (type: 'full' | 'partial') => {
        setRefundType(type)
        if (type === 'full') {
            setAmountText(remainingAmount)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const inputPaise = Math.round(parseFloat(amountText) * 100)
        if (isNaN(inputPaise) || inputPaise <= 0) {
            setError('Please enter a valid refund amount.')
            return
        }
        if (inputPaise > remainingPaise) {
            setError(`Refund cannot exceed remaining balance of ${remainingAmount} ${transaction.currency}.`)
            return
        }

        if (!transaction.id) {
            setError('Transaction ID missing. Please refresh the chat.')
            return
        }

        setLoading(true)
        try {
            const res = await whatsappService.issueRefund(transaction.id, {
                amount_paise: inputPaise,
                reason: reason.trim() || 'Customer requested refund'
            })
            onRefundSuccess(res.transaction)
            toggle()
        } catch (err: any) {
            setError(err?.message || 'Failed to process refund. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="md">
            <ModalHeader toggle={toggle} className="border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <div className="p-1 rounded bg-light-danger">
                        <RotateCcw size={18} className="text-danger" />
                    </div>
                    <div>
                        <h5 className="mb-0 fw-bold">Issue In-Chat Refund</h5>
                        <small className="text-muted">Direct UPI & Meta Pay Reversal</small>
                    </div>
                </div>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
                <ModalBody className="py-3">
                    {error && <Alert color="danger" className="p-2 mb-3">{error}</Alert>}

                    <div className="p-2 border rounded bg-light mb-3" style={{ fontSize: '0.85rem' }}>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Transaction ID:</span>
                            <span className="fw-semibold font-monospace">{transaction.transaction_id}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Original Amount:</span>
                            <span className="fw-bold">{(totalPaise / 100).toFixed(2)} {transaction.currency}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="text-muted">Remaining Balance:</span>
                            <Badge color="light-success" pill className="fw-bold">
                                {remainingAmount} {transaction.currency}
                            </Badge>
                        </div>
                    </div>

                    <FormGroup tag="fieldset" className="mb-3">
                        <Label className="fw-bold small mb-2 d-block">Refund Type</Label>
                        <div className="d-flex gap-3">
                            <FormGroup check>
                                <Input
                                    name="refundType"
                                    type="radio"
                                    id="refundFull"
                                    checked={refundType === 'full'}
                                    onChange={() => handleTypeChange('full')}
                                />
                                <Label check htmlFor="refundFull" className="small">
                                    Full Refund ({remainingAmount} {transaction.currency})
                                </Label>
                            </FormGroup>
                            <FormGroup check>
                                <Input
                                    name="refundType"
                                    type="radio"
                                    id="refundPartial"
                                    checked={refundType === 'partial'}
                                    onChange={() => handleTypeChange('partial')}
                                />
                                <Label check htmlFor="refundPartial" className="small">
                                    Partial Refund
                                </Label>
                            </FormGroup>
                        </div>
                    </FormGroup>

                    {refundType === 'partial' && (
                        <FormGroup className="mb-3">
                            <Label className="small fw-semibold">Refund Amount ({transaction.currency}) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={remainingAmount}
                                value={amountText}
                                onChange={e => setAmountText(e.target.value)}
                                required
                            />
                        </FormGroup>
                    )}

                    <FormGroup className="mb-2">
                        <Label className="small fw-semibold">Reason for Refund *</Label>
                        <Input
                            type="select"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        >
                            <option value="Customer return / dissatisfied">Customer return / dissatisfied</option>
                            <option value="Order cancelled before dispatch">Order cancelled before dispatch</option>
                            <option value="Defective or incorrect item">Defective or incorrect item</option>
                            <option value="Duplicate charge error">Duplicate charge error</option>
                            <option value="Other customer refund request">Other customer refund request</option>
                        </Input>
                    </FormGroup>
                </ModalBody>

                <ModalFooter className="border-top">
                    <Button color="secondary" outline onClick={toggle} disabled={loading}>
                        Cancel
                    </Button>
                    <Button color="danger" type="submit" disabled={loading || remainingPaise <= 0}>
                        {loading ? <Spinner size="sm" /> : 'Confirm & Reverse Payment'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    )
}

export default RefundModal

