// @ts-nocheck
import React from 'react'
import { Card, CardBody, Badge } from 'reactstrap'
import { Smartphone, CheckCircle, AlertTriangle, Shield } from 'react-feather'
import { ConfigRowActions } from './ConfigRowActions'

interface ConfigMobileCardProps {
    row: any
    index: number
    colors: any
    onQualityCheck: (row: any) => void
    onOpenVerificationModal: (row: any) => void
    onRegisterPhone: (row: any) => void
    onSubscribeApps: (row: any) => void
    onOpenEcommerce: (row: any) => void
    onOpenCalling: (row: any) => void
    onDelete: (row: any) => void
    preload: () => void
    deletedState: any
    failedState: any
    onCloseConfirmAlert: (confirmed: boolean, row: any) => void
}

export function ConfigMobileCard({
    row,
    index,
    colors,
    onQualityCheck,
    onOpenVerificationModal,
    onRegisterPhone,
    onSubscribeApps,
    onOpenEcommerce,
    onOpenCalling,
    onDelete,
    preload,
    deletedState,
    failedState,
    onCloseConfirmAlert
}: ConfigMobileCardProps) {
    const isVerified = row?.code_verification_status === 'VERIFIED'
    const quality = (row?.quality_rating || 'UNKNOWN').toUpperCase()

    const getQualityBadgeColor = (q: string) => {
        if (q === 'GREEN') return 'success'
        if (q === 'YELLOW') return 'warning'
        if (q === 'RED') return 'danger'
        return 'secondary'
    }

    return (
        <Card className="mb-2 shadow-sm border border-light rounded-3 overflow-hidden">
            <CardBody className="p-3">
                {/* Header: Name and Status */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="p-2 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: '#fff4eb', color: '#ff8c21' }}
                        >
                            <Smartphone size={16} />
                        </div>
                        <div>
                            <div className="fw-bolder fs-6 text-dark mb-0 d-flex align-items-center gap-1">
                                {row?.name || 'Unnamed Line'}
                                {isVerified ? (
                                    <CheckCircle size={14} className="text-success" />
                                ) : (
                                    <AlertTriangle size={14} className="text-warning" />
                                )}
                            </div>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                #{index + 1} • {row?.verified_name || 'No Verified Name'}
                            </small>
                        </div>
                    </div>

                    <Badge color={getQualityBadgeColor(quality)} pill style={{ fontSize: '0.7rem' }}>
                        {quality}
                    </Badge>
                </div>

                {/* Details Grid */}
                <div className="bg-light p-2 rounded-2 mb-2" style={{ fontSize: '0.8rem' }}>
                    <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Sender Number:</span>
                        <span className="fw-semibold text-dark font-monospace">
                            {row?.display_phone_number_req || row?.sender_number || 'N/A'}
                        </span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">WABA ID:</span>
                        <span className="text-truncate ms-2 fw-medium" style={{ maxWidth: '170px' }}>
                            {row?.business_account_id || row?.waba_id || 'N/A'}
                        </span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Verification:</span>
                        <span className={`fw-semibold ${isVerified ? 'text-success' : 'text-danger'}`}>
                            {row?.code_verification_status || 'NOT_VERIFIED'}
                        </span>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="d-flex align-items-center justify-content-end pt-1 border-top">
                    <ConfigRowActions
                        row={row}
                        colors={colors}
                        onQualityCheck={onQualityCheck}
                        onOpenVerificationModal={onOpenVerificationModal}
                        onRegisterPhone={onRegisterPhone}
                        onSubscribeApps={onSubscribeApps}
                        onOpenEcommerce={onOpenEcommerce}
                        onOpenCalling={onOpenCalling}
                        onDelete={onDelete}
                        preload={preload}
                        deletedState={deletedState}
                        failedState={failedState}
                        onCloseConfirmAlert={onCloseConfirmAlert}
                    />
                </div>
            </CardBody>
        </Card>
    )
}

