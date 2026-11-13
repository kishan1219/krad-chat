import React, { useEffect, useState } from 'react'
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    RefreshCw,
    X
} from 'react-feather'
import {
    Modal,
    ModalHeader,
    ModalBody,
    Row,
    Col,
    Button,
    Badge,
    Card,
    CardBody,
    Alert
} from 'reactstrap'
import {
    whatsappService,
    WhatsAppConnection,
    QualityForecastResult
} from '../../../../services/whatsappService'

interface QualityForecastModalProps {
    connection: WhatsAppConnection | null
    isOpen: boolean
    onClose: () => void
}

export function QualityForecastModal({
    connection,
    isOpen,
    onClose
}: QualityForecastModalProps) {
    const [loading, setLoading] = useState(true)
    const [forecast, setForecast] = useState<QualityForecastResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen || !connection) return
        setLoading(true)
        setError(null)
        whatsappService.getQualityForecast(connection.id)
            .then(res => setForecast(res))
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch forecast'))
            .finally(() => setLoading(false))
    }, [isOpen, connection])

    if (!isOpen || !connection) return null

    return (
        <Modal
            isOpen={isOpen}
            toggle={onClose}
            centered
            size="md"
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
                        <Shield size={18} />
                    </div>
                    <div>
                        <span className="fw-bolder" style={{ color: '#5e5873', fontSize: '1.05rem' }}>
                            Proactive Quality Health Forecast
                        </span>
                        <div className="small text-muted font-monospace" style={{ fontSize: '0.78rem' }}>
                            {connection.display_phone_number || connection.phone_number_id}
                        </div>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="p-2">
                {loading ? (
                    <div className="text-center py-3 text-muted">Calculating 24h quality telemetry...</div>
                ) : error ? (
                    <Alert color="danger" className="p-1 small mb-0">{error}</Alert>
                ) : forecast ? (
                    <div>
                        {/* Risk Level Banner */}
                        <Card
                            className="mb-2 border shadow-none"
                            style={{
                                backgroundColor:
                                    forecast.risk_level === 'CRITICAL'
                                        ? '#fff0f0'
                                        : forecast.risk_level === 'HIGH'
                                        ? '#fff8f0'
                                        : '#f0fff4',
                                borderColor:
                                    forecast.risk_level === 'CRITICAL'
                                        ? '#ffcdd2'
                                        : forecast.risk_level === 'HIGH'
                                        ? '#ffe0b2'
                                        : '#c8e6c9'
                            }}
                        >
                            <CardBody className="p-1 d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="small text-muted">Predicted Degradation Risk:</span>
                                    <h5 className="fw-bolder mb-0 mt-25">
                                        {forecast.risk_level} RISK
                                    </h5>
                                </div>
                                <Badge
                                    color={
                                        forecast.risk_level === 'CRITICAL'
                                            ? 'danger'
                                            : forecast.risk_level === 'HIGH'
                                            ? 'warning'
                                            : 'success'
                                    }
                                    pill
                                    className="px-1 py-50"
                                >
                                    Current: {forecast.current_quality}
                                </Badge>
                            </CardBody>
                        </Card>

                        {/* Telemetry Metrics */}
                        <Row className="g-1 mb-2">
                            <Col xs="6">
                                <div className="p-1 border rounded text-center">
                                    <div className="text-muted small">24h Block Rate</div>
                                    <h4 className="fw-bolder mb-0 text-danger">{forecast.block_rate_percentage}%</h4>
                                </div>
                            </Col>
                            <Col xs="6">
                                <div className="p-1 border rounded text-center">
                                    <div className="text-muted small">Sent (24h)</div>
                                    <h4 className="fw-bolder mb-0">{forecast.sample_size_24h}</h4>
                                </div>
                            </Col>
                        </Row>

                        {/* Recommendation */}
                        <div className="p-1 rounded bg-light border">
                            <div className="small fw-bold text-muted mb-50">Heuristic Recommendations:</div>
                            <ul className="small mb-0 text-dark ps-1" style={{ lineHeight: 1.6 }}>
                                {forecast.recommendations && forecast.recommendations.length > 0 ? (
                                    forecast.recommendations.map((rec, idx) => (
                                        <li key={idx}>{rec}</li>
                                    ))
                                ) : (
                                    <li>Maintain current dispatch velocity and opt-in standards.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                ) : null}
            </ModalBody>
        </Modal>
    )
}
