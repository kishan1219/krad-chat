import React from 'react'
import { Check, Smartphone } from 'react-feather'
import { Card, CardBody, Button, Badge, Input } from 'reactstrap'
import { MetaWabaPhoneNumber } from '../../../../services/whatsappService'

interface WabaMultiNumberSelectorProps {
    numbers: MetaWabaPhoneNumber[]
    selectedIds: string[]
    onToggleSelection: (id: string) => void
    numberLabels: Record<string, string>
    onUpdateLabel: (id: string, label: string) => void
    busy: boolean
    onBack: () => void
    onBatchConnect: () => void
}

export const WabaMultiNumberSelector: React.FC<WabaMultiNumberSelectorProps> = ({
    numbers,
    selectedIds,
    onToggleSelection,
    numberLabels,
    onUpdateLabel,
    busy,
    onBack,
    onBatchConnect
}) => {
    return (
        <div className="py-1">
            <div className="mb-2">
                <div className="d-flex align-items-center gap-1 mb-50">
                    <Smartphone size={20} style={{ color: '#ff8c21' }} />
                    <h4 className="fw-bolder mb-0" style={{ color: '#5e5873' }}>
                        Multiple Phone Numbers Detected
                    </h4>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
                    Your WhatsApp Business Account contains multiple registered phone lines.
                    Select the numbers you want to connect simultaneously to this workspace.
                </p>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="pe-50 mb-2">
                {numbers.map((num) => {
                    const isSelected = selectedIds.includes(num.id)
                    const label = numberLabels[num.id] ?? num.verified_name ?? ''

                    return (
                        <Card
                            key={num.id}
                            onClick={() => onToggleSelection(num.id)}
                            className="mb-1 cursor-pointer transition-all"
                            style={{
                                border: isSelected ? '1.5px solid #ff8c21' : '1px solid #d8d6de',
                                backgroundColor: isSelected ? '#fff8f2' : '#ffffff',
                                borderRadius: '8px'
                            }}
                        >
                            <CardBody className="p-1 d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-1">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '4px',
                                            border: isSelected ? 'none' : '1px solid #b9b9c3',
                                            backgroundColor: isSelected ? '#ff8c21' : '#fff',
                                            color: '#fff'
                                        }}
                                    >
                                        {isSelected && <Check size={14} />}
                                    </div>
                                    <div>
                                        <div className="fw-bolder" style={{ color: '#22292f', fontSize: '0.92rem' }}>
                                            {num.display_phone_number || num.id}
                                        </div>
                                        <div className="text-muted small">
                                            <span>Rating: </span>
                                            <Badge
                                                color={
                                                    num.quality_rating === 'GREEN'
                                                        ? 'light-success'
                                                        : num.quality_rating === 'YELLOW'
                                                        ? 'light-warning'
                                                        : 'light-danger'
                                                }
                                                pill
                                            >
                                                {num.quality_rating || 'GREEN'}
                                            </Badge>
                                            {num.code_verification_status && (
                                                <span className="ms-50">• {num.code_verification_status}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div onClick={(e) => e.stopPropagation()} style={{ minWidth: '180px' }}>
                                    <Input
                                        type="text"
                                        bsSize="sm"
                                        value={label}
                                        onChange={(e) => onUpdateLabel(num.id, e.target.value)}
                                        placeholder="Custom label / department..."
                                        style={{ borderRadius: '6px', fontSize: '0.82rem' }}
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    )
                })}
            </div>

            <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-3">
                <span className="text-muted small">
                    {selectedIds.length} of {numbers.length} numbers selected
                </span>
                <div className="d-flex gap-2">
                    <Button
                        color="secondary"
                        outline
                        type="button"
                        onClick={onBack}
                        style={{
                            borderRadius: '6px',
                            padding: '0.6rem 1.75rem',
                            fontWeight: 500,
                            borderColor: '#b9b9c3',
                            color: '#6e6b7b'
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        type="button"
                        disabled={busy || selectedIds.length === 0}
                        onClick={onBatchConnect}
                        style={{
                            backgroundColor: '#ff8c21',
                            borderColor: '#ff8c21',
                            color: '#ffffff',
                            borderRadius: '6px',
                            padding: '0.6rem 2.25rem',
                            fontWeight: 600,
                            boxShadow: '0 2px 6px rgba(255,140,33,0.3)'
                        }}
                    >
                        {busy ? 'Connecting...' : `Connect ${selectedIds.length} Numbers`}
                    </Button>
                </div>
            </div>
        </div>
    )
}
