import React from 'react'
import { Card, CardBody, Row, Col } from 'reactstrap'
import { Smartphone, Activity, Shield, Zap } from 'react-feather'
import { WhatsAppConnection } from '../../../../services/whatsappService'

interface ConnectionsMetricsProps {
    connections: WhatsAppConnection[]
}

export function ConnectionsMetrics({ connections }: ConnectionsMetricsProps) {
    const total = connections.length
    const active = connections.filter(c => c.status === 'connected' || c.status === 'verified').length
    const highQuality = connections.filter(c => (c.quality_rating || 'GREEN').toUpperCase() === 'GREEN').length
    const highTier = connections.filter(c => {
        const tier = (c.messaging_limit_tier || '').toUpperCase()
        return tier.includes('10K') || tier.includes('100K') || tier.includes('UNLIMITED')
    }).length

    const cards = [
        {
            label: 'Total Phone Lines',
            value: total,
            subtext: `${active} active & connected`,
            icon: Smartphone,
            bgColor: '#eff6ff',
            textColor: '#2563eb'
        },
        {
            label: 'Operational Uptime',
            value: total > 0 ? `${Math.round((active / total) * 100)}%` : '100%',
            subtext: active > 0 ? 'Live & ready for chats' : 'Standby / Ready',
            icon: Activity,
            bgColor: '#ecfdf5',
            textColor: '#059669'
        },
        {
            label: 'Meta Quality Health',
            value: total > 0 ? `${Math.round((highQuality / total) * 100)}%` : '100%',
            subtext: `${highQuality} lines rated Green`,
            icon: Shield,
            bgColor: '#f5f3ff',
            textColor: '#7c3aed'
        },
        {
            label: 'Limit Scalability',
            value: highTier,
            subtext: 'Tier 10K+ or Unlimited',
            icon: Zap,
            bgColor: '#fff7ed',
            textColor: '#ea580c'
        }
    ]

    return (
        <Row className="g-2 mb-3">
            {cards.map((card, idx) => {
                const Icon = card.icon
                return (
                    <Col key={idx} xs="12" sm="6" lg="3">
                        <Card
                            className="border shadow-none rounded-3 mb-0 h-100"
                            style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
                        >
                            <CardBody className="p-3 d-flex flex-column justify-content-between">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span
                                        className="fw-semibold text-muted text-uppercase"
                                        style={{ fontSize: '0.75rem', letterSpacing: '0.4px' }}
                                    >
                                        {card.label}
                                    </span>
                                    <div
                                        className="rounded-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            backgroundColor: card.bgColor,
                                            color: card.textColor
                                        }}
                                    >
                                        <Icon size={18} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="fw-bolder mb-1 text-dark" style={{ fontSize: '1.75rem' }}>
                                        {card.value}
                                    </h3>
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        {card.subtext}
                                    </span>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                )
            })}
        </Row>
    )
}
