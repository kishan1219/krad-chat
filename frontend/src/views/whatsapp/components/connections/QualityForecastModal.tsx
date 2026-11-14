import React, { useEffect, useState } from 'react'
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    RefreshCw,
    X,
    Activity,
    TrendingUp,
    HelpCircle
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
    Alert,
    Progress
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

    const fetchForecast = () => {
        if (!connection) return
        setLoading(true)
        setError(null)
        whatsappService.getQualityForecast(connection.id)
            .then(res => setForecast(res))
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch quality forecast'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (isOpen && connection) {
            fetchForecast()
        }
    }, [isOpen, connection])

    if (!isOpen || !connection) return null

    const deliverySuccessRate = forecast?.delivery_success_rate ?? (
        forecast ? Number((100 - forecast.block_rate_percentage).toFixed(1)) : 99.2
    )

    return (
        <Modal
            isOpen={isOpen}
            toggle={onClose}
            centered
            size="lg"
            className="modal-dialog-centered"
            contentClassName="rounded-3 shadow-lg border-0 overflow-hidden"
        >
            <ModalHeader
                toggle={onClose}
                className="border-bottom py-2 px-3 bg-light"
                close={
                    <Button color="link" size="sm" className="p-0 text-muted" onClick={onClose}>
                        <X size={20} />
                    </Button>
                }
            >
                <div className="d-flex align-items-center gap-2">
                    <div
                        className="d-flex align-items-center justify-content-center rounded-3 p-1"
                        style={{ backgroundColor: '#fff7ed', color: '#ff8c21' }}
                    >
                        <Activity size={20} />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-bolder text-dark" style={{ fontSize: '1.05rem' }}>
                                Automatic Quality Tier Visualizer
                            </span>
                            <Badge color="light-warning" pill style={{ fontSize: '0.7rem' }}>
                                Live 24h Telemetry
                            </Badge>
                        </div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>
                            {connection.name} • {connection.display_phone_number || connection.phone_number_id}
                        </div>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="p-3">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted small mt-2 mb-0">Analyzing 24-hour message delivery telemetry & block rates...</p>
                    </div>
                ) : error ? (
                    <Alert color="danger" className="p-2 mb-0 rounded-2" style={{ fontSize: '0.85rem' }}>
                        {error}
                    </Alert>
                ) : forecast ? (
                    <div>
                        {/* Hero 24h Delivery Success Visualizer */}
                        <Card
                            className="border shadow-none rounded-3 mb-3"
                            style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                borderColor: '#e2e8f0'
                            }}
                        >
                            <CardBody className="p-3">
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                                    <div>
                                        <span className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                            Live 24-Hour Delivery Success Rate
                                        </span>
                                        <div className="d-flex align-items-baseline gap-2 mt-1">
                                            <h2 className="fw-bolder mb-0" style={{ fontSize: '2.5rem', color: deliverySuccessRate >= 97 ? '#16a34a' : deliverySuccessRate >= 95 ? '#d97706' : '#dc2626' }}>
                                                {deliverySuccessRate}%
                                            </h2>
                                            <Badge
                                                color={
                                                    forecast.risk_level === 'CRITICAL'
                                                        ? 'danger'
                                                        : forecast.risk_level === 'HIGH'
                                                        ? 'warning'
                                                        : forecast.risk_level === 'MODERATE'
                                                        ? 'info'
                                                        : 'success'
                                                }
                                                pill
                                                className="py-1 px-2"
                                                style={{ fontSize: '0.78rem' }}
                                            >
                                                {forecast.risk_level} RISK
                                            </Badge>
                                        </div>
                                        <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.82rem' }}>
                                            {deliverySuccessRate >= 97
                                                ? 'Optimal Meta line health. Dispatch delivery is within safe parameters.'
                                                : 'Elevated rejection or block rate detected. Monitor recipient opt-in consent.'}
                                        </p>
                                    </div>

                                    <div className="d-flex flex-column align-items-end">
                                        <div className="text-muted small mb-1">Current Meta Quality Rating</div>
                                        <Badge
                                            color={
                                                forecast.current_quality === 'GREEN'
                                                    ? 'light-success'
                                                    : forecast.current_quality === 'YELLOW'
                                                    ? 'light-warning'
                                                    : 'light-danger'
                                            }
                                            pill
                                            className="px-3 py-1"
                                            style={{ fontSize: '0.85rem', fontWeight: 700 }}
                                        >
                                            {forecast.current_quality} QUALITY
                                        </Badge>
                                        {forecast.hours_to_downgrade && (
                                            <span className="text-danger small mt-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                                                <Clock size={12} /> Downgrade risk in ~{forecast.hours_to_downgrade}h
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Delivery Success Progress Bar */}
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                                        <span>Delivery Performance Meter</span>
                                        <span className="fw-semibold text-dark">{deliverySuccessRate}% Delivered</span>
                                    </div>
                                    <Progress
                                        value={deliverySuccessRate}
                                        color={deliverySuccessRate >= 97 ? 'success' : deliverySuccessRate >= 95 ? 'warning' : 'danger'}
                                        style={{ height: '8px', borderRadius: '4px' }}
                                    />
                                    <div className="d-flex justify-content-between text-muted small mt-1" style={{ fontSize: '0.7rem' }}>
                                        <span>Safeguard Cutoff (95.0%)</span>
                                        <span>Meta Warning Threshold (97.0%)</span>
                                        <span className="text-success fw-semibold">Target (99.0%+)</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Telemetry Breakdown Cards */}
                        <Row className="g-2 mb-3">
                            <Col xs="6" sm="3">
                                <div className="p-2 border rounded-2 text-center bg-white" style={{ borderColor: '#e2e8f0' }}>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>24h Block Rate</div>
                                    <h4 className="fw-bolder mb-0 mt-1" style={{ color: forecast.block_rate_percentage >= 3 ? '#dc2626' : '#16a34a' }}>
                                        {forecast.block_rate_percentage}%
                                    </h4>
                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>Limit: 3.0%</small>
                                </div>
                            </Col>
                            <Col xs="6" sm="3">
                                <div className="p-2 border rounded-2 text-center bg-white" style={{ borderColor: '#e2e8f0' }}>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Headroom Margin</div>
                                    <h4 className="fw-bolder mb-0 mt-1" style={{ color: '#2563eb' }}>
                                        {Math.max(0, Number((3.0 - forecast.block_rate_percentage).toFixed(1)))}%
                                    </h4>
                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>Safe buffer</small>
                                </div>
                            </Col>
                            <Col xs="6" sm="3">
                                <div className="p-2 border rounded-2 text-center bg-white" style={{ borderColor: '#e2e8f0' }}>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>24h Sample Size</div>
                                    <h4 className="fw-bolder mb-0 mt-1 text-dark">
                                        {forecast.sample_size_24h}
                                    </h4>
                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>Messages tracked</small>
                                </div>
                            </Col>
                            <Col xs="6" sm="3">
                                <div className="p-2 border rounded-2 text-center bg-white" style={{ borderColor: '#e2e8f0' }}>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Predicted Tier</div>
                                    <h4 className="fw-bolder mb-0 mt-1" style={{ color: forecast.predicted_quality === 'GREEN' ? '#16a34a' : '#d97706' }}>
                                        {forecast.predicted_quality}
                                    </h4>
                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>Next 24h outlook</small>
                                </div>
                            </Col>
                        </Row>

                        {/* Heuristic Recommendations */}
                        <div className="p-3 rounded-2 border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                            <div className="d-flex align-items-center gap-1 mb-2">
                                <Shield size={16} style={{ color: '#ff8c21' }} />
                                <span className="fw-bold text-dark small" style={{ textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: '0.78rem' }}>
                                    Automated Deliverability Recommendations
                                </span>
                            </div>
                            <ul className="small mb-0 text-dark ps-3" style={{ lineHeight: 1.7, fontSize: '0.82rem' }}>
                                {forecast.recommendations && forecast.recommendations.length > 0 ? (
                                    forecast.recommendations.map((rec, idx) => (
                                        <li key={idx} className="mb-1">{rec}</li>
                                    ))
                                ) : (
                                    <li>Phone health is optimal. Maintain current messaging practices and opt-in standards.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                ) : null}
            </ModalBody>

            <div className="border-top py-2 px-3 bg-light d-flex justify-content-between align-items-center">
                <Button color="secondary" size="sm" onClick={onClose} outline>
                    Close
                </Button>
                <Button
                    color="primary"
                    size="sm"
                    onClick={fetchForecast}
                    disabled={loading}
                    className="d-inline-flex align-items-center gap-1"
                    style={{ backgroundColor: '#ff8c21', borderColor: '#ff8c21' }}
                >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Telemetry</span>
                </Button>
            </div>
        </Modal>
    )
}

export default QualityForecastModal
