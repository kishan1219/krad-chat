import React, { useState, useEffect } from 'react'
import { Badge, Button } from 'reactstrap'
import { CheckCircle, Clock, AlertCircle, Copy, Check, RotateCcw } from 'react-feather'
import RefundModal from './RefundModal'

export interface PaymentCardData {
    id?: number | string
    status: 'success' | 'pending' | 'failed' | 'canceled'
    reference_id: string
    transaction_id: string
    amount_paise: number
    currency: string
    payment_type?: string
    refund_status?: 'none' | 'partial' | 'full'
    refunded_amount_paise?: number
}

interface PaymentMessageCardProps {
    data: PaymentCardData
    receivedDate?: string
    onRefundSuccess?: (updatedTx: any) => void
}

const PaymentMessageCard: React.FC<PaymentMessageCardProps> = ({
    data,
    receivedDate,
    onRefundSuccess
}) => {
    const [cardData, setCardData] = useState<PaymentCardData>(data)
    const [copied, setCopied] = useState(false)
    const [refundModalOpen, setRefundModalOpen] = useState(false)

    useEffect(() => {
        setCardData(data)
    }, [data])

    const handleCopy = () => {
        if (cardData.transaction_id) {
            navigator.clipboard.writeText(cardData.transaction_id)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const isSuccess = cardData.status === 'success'
    const isPending = cardData.status === 'pending'
    const isFullRefund = cardData.refund_status === 'full'
    const isPartialRefund = cardData.refund_status === 'partial'

    const formattedAmount = (cardData.amount_paise / 100).toLocaleString('en-IN', {
        style: 'currency',
        currency: cardData.currency || 'INR'
    })

    const formattedRefunded = cardData.refunded_amount_paise
        ? (cardData.refunded_amount_paise / 100).toLocaleString('en-IN', {
              style: 'currency',
              currency: cardData.currency || 'INR'
          })
        : null

    const handleRefundSuccess = (updatedTx: any) => {
        setCardData(prev => ({
            ...prev,
            refund_status: updatedTx.refund_status,
            refunded_amount_paise: updatedTx.refunded_amount_paise
        }))
        if (onRefundSuccess) onRefundSuccess(updatedTx)
    }

    const statusBadge = isSuccess ? (
        <Badge color="light-success" className="d-flex align-items-center gap-1">
            <CheckCircle size={12} className="text-success" />
            <span>Success</span>
        </Badge>
    ) : isPending ? (
        <Badge color="light-warning" className="d-flex align-items-center gap-1">
            <Clock size={12} className="text-warning" />
            <span>Pending</span>
        </Badge>
    ) : (
        <Badge color="light-danger" className="d-flex align-items-center gap-1">
            <AlertCircle size={12} className="text-danger" />
            <span>Failed</span>
        </Badge>
    )

    return (
        <div
            className="p-3 my-1 rounded-3 shadow-sm border"
            style={{
                backgroundColor: isSuccess ? '#f0fdf4' : isPending ? '#fffbeb' : '#fef2f2',
                borderColor: isSuccess ? '#bbf7d0' : isPending ? '#fde68a' : '#fecaca',
                maxWidth: '320px'
            }}
        >
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                    {cardData.payment_type?.toUpperCase() || 'UPI / META PAY'}
                </span>
                {statusBadge}
            </div>

            <div className="my-2">
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Amount Received</div>
                <div className="fw-bolder" style={{ fontSize: '1.4rem', color: isSuccess ? '#15803d' : '#374151' }}>
                    {formattedAmount}
                </div>
            </div>

            {isFullRefund && (
                <div className="mb-2">
                    <Badge color="light-danger" className="d-flex align-items-center gap-1 py-1 px-2">
                        <RotateCcw size={11} />
                        <span>Fully Refunded ({formattedRefunded})</span>
                    </Badge>
                </div>
            )}

            {isPartialRefund && (
                <div className="mb-2">
                    <Badge color="light-warning" className="d-flex align-items-center gap-1 py-1 px-2">
                        <RotateCcw size={11} />
                        <span>Partial Refund: {formattedRefunded}</span>
                    </Badge>
                </div>
            )}

            <div className="border-top pt-2 mt-2" style={{ fontSize: '0.75rem' }}>
                <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Ref ID:</span>
                    <span className="fw-semibold text-truncate ms-1" style={{ maxWidth: '160px' }}>
                        {cardData.reference_id}
                    </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Txn ID:</span>
                    <div className="d-flex align-items-center">
                        <span className="fw-semibold text-truncate me-1 font-monospace" style={{ maxWidth: '140px' }}>
                            {cardData.transaction_id}
                        </span>
                        <Button
                            color="link"
                            className="p-0 text-muted"
                            onClick={handleCopy}
                            title="Copy Transaction ID"
                        >
                            {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </Button>
                    </div>
                </div>
            </div>

            {isSuccess && !isFullRefund && (
                <Button
                    color="danger"
                    outline
                    size="sm"
                    className="w-100 mt-2 py-1 d-flex align-items-center justify-content-center gap-1"
                    onClick={() => setRefundModalOpen(true)}
                >
                    <RotateCcw size={12} />
                    <span>Issue Refund</span>
                </Button>
            )}

            {receivedDate && (
                <div className="text-end text-muted mt-2" style={{ fontSize: '0.65rem' }}>
                    {receivedDate}
                </div>
            )}

            <RefundModal
                isOpen={refundModalOpen}
                toggle={() => setRefundModalOpen(!refundModalOpen)}
                transaction={{
                    id: cardData.id || cardData.transaction_id,
                    reference_id: cardData.reference_id,
                    transaction_id: cardData.transaction_id,
                    amount_paise: cardData.amount_paise,
                    currency: cardData.currency,
                    refunded_amount_paise: cardData.refunded_amount_paise
                }}
                onRefundSuccess={handleRefundSuccess}
            />
        </div>
    )
}

export default PaymentMessageCard
