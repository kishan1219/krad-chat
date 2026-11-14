import React, { useEffect, useState } from 'react'
import { Card, CardBody, Row, Col, Badge, Button } from 'reactstrap'
import {
    Activity,
    Server,
    Smartphone,
    Shield,
    TrendingUp,
    RefreshCw,
    AlertTriangle
} from 'react-feather'
import {
    whatsappService,
    MultiWabaDashboardData
} from '../../../../services/whatsappService'
import { ErrorToast } from '../../../../utility/Utils'

interface MultiWabaDashboardProps {
    onSwitchToLines: () => void
}

export function MultiWabaDashboard({ onSwitchToLines }: MultiWabaDashboardProps) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<MultiWabaDashboardData | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboard = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await whatsappService.getMultiWabaDashboard()
            setData(res)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load enterprise dashboard'
            setError(msg)
            ErrorToast(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboard()
    }, [])

    if (loading) {
        return (
            <Card className="border shadow-none rounded-3 p-5 text-center mb-3" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                <CardBody>
                    <RefreshCw size={28} className="animate-spin text-warning mx-auto mb-2" />
                    <p className="small text-muted mb-0">
                        Aggregating enterprise metrics across WhatsApp Business Accounts...
                    </p>
                </CardBody>
            </Card>
        )
    }

    if (error || !data) {
        return (
            <Card className="border shadow-none rounded-3 p-4 text-center mb-3" style={{ backgroundColor: '#fff5f5', borderColor: '#feb2b2' }}>
                <CardBody>
                    <AlertTriangle size={28} className="text-danger mx-auto mb-2" />
                    <h5 className="fw-bold text-danger mb-1">Failed to Load Multi-WABA Dashboard</h5>
                    <p className="small text-danger mb-3">{error}</p>
                    <Button color="danger" size="sm" onClick={fetchDashboard} className="fw-semibold">
                        Retry
                    </Button>
                </CardBody>
            </Card>
        )
    }

    return (
        <div className="mb-3">
            {/* Top Aggregate Summary Cards */}
            <Row className="g-2 mb-3">
                <Col xs="12" sm="6" lg="3">
                    <Card className="border shadow-none rounded-3 mb-0 h-100" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                        <CardBody className="p-3 d-flex flex-column justify-content-between">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Total WABAs</span>
                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: '#fff7ed', color: '#ff8c21' }}>
                                    <Server size={18} />
                                </div>
                            </div>
                            <div>
                                <h3 className="fw-bolder mb-1 text-dark" style={{ fontSize: '1.75rem' }}>{data.total_wabas}</h3>
                                <span className="text-muted small">Enterprise Business Accounts</span>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xs="12" sm="6" lg="3">
                    <Card className="border shadow-none rounded-3 mb-0 h-100" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                        <CardBody className="p-3 d-flex flex-column justify-content-between">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Active Numbers</span>
                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: '#ecfdf5', color: '#059669' }}>
                                    <Smartphone size={18} />
                                </div>
                            </div>
                            <div>
                                <h3 className="fw-bolder mb-1 text-dark" style={{ fontSize: '1.75rem' }}>{data.total_phone_numbers}</h3>
                                <span className="text-muted small">{data.active_connections} operational lines</span>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xs="12" sm="6" lg="3">
                    <Card className="border shadow-none rounded-3 mb-0 h-100" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                        <CardBody className="p-3 d-flex flex-column justify-content-between">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>7-Day Volume</span>
                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                                    <TrendingUp size={18} />
                                </div>
                            </div>
                            <div>
                                <h3 className="fw-bolder mb-1 text-dark" style={{ fontSize: '1.75rem' }}>{data.total_messages_7d.toLocaleString()}</h3>
                                <span className="text-muted small">Aggregated messages dispatched</span>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xs="12" sm="6" lg="3">
                    <Card className="border shadow-none rounded-3 mb-0 h-100" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                        <CardBody className="p-3 d-flex flex-column justify-content-between">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Quality Health</span>
                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                                    <Shield size={18} />
                                </div>
                            </div>
                            <div>
                                <div className="d-flex align-items-center gap-1 mb-1">
                                    <Badge color="light-success" pill>{data.quality_summary.green} High</Badge>
                                    {data.quality_summary.yellow > 0 && <Badge color="light-warning" pill>{data.quality_summary.yellow} Med</Badge>}
                                    {data.quality_summary.red > 0 && <Badge color="light-danger" pill>{data.quality_summary.red} Low</Badge>}
                                </div>
                                <span className="text-muted small">Meta ratings distribution</span>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* 7-Day Aggregate Volume Activity */}
            <Card className="border shadow-none rounded-3 mb-3" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                <CardBody className="p-3">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-1">
                                <Activity size={16} style={{ color: '#ff8c21' }} />
                                <span>Enterprise 7-Day Message Throughput</span>
                            </h6>
                            <small className="text-muted">Aggregated volume across all connected WhatsApp Business Accounts</small>
                        </div>
                        <Button color="light" size="sm" onClick={fetchDashboard} title="Refresh Data" className="p-1">
                            <RefreshCw size={14} />
                        </Button>
                    </div>

                    <Row className="g-2 pt-2 text-center">
                        {data.time_series.map((day, idx) => {
                            const maxVal = Math.max(...data.time_series.map(t => t.sent), 1)
                            const heightPct = Math.min(100, Math.max(15, Math.round((day.sent / maxVal) * 100)))
                            return (
                                <Col key={idx} xs="true" className="d-flex flex-column align-items-center">
                                    <span className="font-monospace small text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                                        {day.sent}
                                    </span>
                                    <div className="w-100 bg-light rounded-2 d-flex align-items-end p-1" style={{ height: '90px' }}>
                                        <div
                                            style={{
                                                height: `${heightPct}%`,
                                                backgroundColor: '#ff8c21',
                                                borderRadius: '4px',
                                                width: '100%',
                                                transition: 'height 0.4s'
                                            }}
                                        />
                                    </div>
                                    <span className="small text-muted mt-1 fw-semibold" style={{ fontSize: '0.7rem' }}>
                                        {day.date.slice(5)}
                                    </span>
                                </Col>
                            )
                        })}
                    </Row>
                </CardBody>
            </Card>

            {/* Accounts Breakdown Card */}
            <Card className="border shadow-none rounded-3 mb-3 overflow-hidden" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                    <div>
                        <h6 className="fw-bold mb-0 text-dark">Connected WhatsApp Business Accounts</h6>
                        <small className="text-muted">{data.wabas.length} WABA portfolios managed</small>
                    </div>
                    <Button color="link" size="sm" onClick={onSwitchToLines} className="p-0 text-decoration-none fw-semibold" style={{ color: '#ff8c21', fontSize: '0.85rem' }}>
                        View Individual Lines →
                    </Button>
                </div>
                <div>
                    {data.wabas.map((waba, idx) => (
                        <div key={idx} className="p-3 border-bottom d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2">
                            <div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{waba.name}</span>
                                    <Badge color="light-secondary" pill className="font-monospace" style={{ fontSize: '0.7rem' }}>
                                        ID: {waba.waba_id}
                                    </Badge>
                                </div>
                                <div className="small text-muted mt-1 d-flex align-items-center gap-2">
                                    <span>{waba.phone_count} Phone Numbers</span>
                                    <span>•</span>
                                    <span>Messaging Tier: <strong style={{ color: '#ff8c21' }}>{waba.messaging_limit}</strong></span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-1 flex-wrap">
                                {waba.phone_numbers.map((p, pIdx) => (
                                    <Badge key={pIdx} color="light-primary" pill className="d-inline-flex align-items-center gap-1 py-1 px-2 font-monospace" style={{ fontSize: '0.75rem' }}>
                                        <Smartphone size={11} className="text-success" />
                                        <span>{p.display_phone_number || p.name}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
export default MultiWabaDashboard
