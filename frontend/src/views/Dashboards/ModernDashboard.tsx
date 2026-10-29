import { useEffect, useState } from 'react'
import type { ApexOptions } from 'apexcharts'
import DashboardRounded from '@mui/icons-material/DashboardRounded'
import WhatsApp from '@mui/icons-material/WhatsApp'
import Chart from 'react-apexcharts'
import { Activity, MessageCircle, RefreshCw, TrendingUp, Users, Zap } from 'react-feather'
import { Badge, Button, ButtonGroup, Card, CardBody, CardHeader, CardTitle, Col, Progress, Row, Spinner } from 'reactstrap'
import { loadDashboard } from '../../utility/apis/dashboard'
import { formatIndianNumberWithDecimals } from '../../utility/helpers/common'
import Header from '../components/header'
import './modern-dashboard.scss'

type MetricValue = number | string | null | undefined

interface StatusWise {
    stat: string
    total_counts: number
}

interface CreditInfo {
    total_users: MetricValue
    transaction: MetricValue
    promotional: MetricValue
    two_waysms: MetricValue
    voice_sms: MetricValue
    whatsapp: MetricValue
}

interface TillYesterdayStats {
    total_credit_used: MetricValue
    total_sent: MetricValue
    total_delivered: MetricValue
    total_failed: MetricValue
    total_block_number?: MetricValue
    total_invalid_number?: MetricValue
    total_read?: MetricValue
    total_other?: MetricValue
    total_process?: MetricValue
}

interface TodaySms {
    total_submission: MetricValue
    total_credit_used: MetricValue
    status_wise: StatusWise[]
}

interface TodaySimple {
    total_submission: MetricValue
    total_credit_used: MetricValue
}

interface DashboardData {
    credit_info: CreditInfo
    till_yesterday_sms: TillYesterdayStats
    till_yesterday_voice: TillYesterdayStats
    till_yesterday_whatsapp: TillYesterdayStats
    today_sms: TodaySms
    today_voice: TodaySimple
    today_whatsapp: TodaySimple
}

const FALLBACK_DATA: DashboardData = {
    credit_info: {
        total_users: 164,
        transaction: '4378321688',
        promotional: '70',
        two_waysms: '0',
        voice_sms: '20',
        whatsapp: '2137615.6155'
    },
    till_yesterday_sms: {
        total_credit_used: '6962136',
        total_sent: '2794881',
        total_delivered: '2454322',
        total_failed: '132716',
        total_block_number: '18',
        total_invalid_number: '271',
        total_process: '207554'
    },
    till_yesterday_voice: {
        total_credit_used: null,
        total_sent: null,
        total_delivered: null,
        total_failed: null,
        total_block_number: null,
        total_invalid_number: null,
        total_process: null
    },
    till_yesterday_whatsapp: {
        total_credit_used: '81326.3450',
        total_sent: '111706',
        total_delivered: '14332',
        total_read: '22390',
        total_failed: '18847',
        total_other: '2025',
        total_process: '52032'
    },
    today_sms: {
        total_submission: '104157',
        total_credit_used: '205170',
        status_wise: [
            { stat: 'ACCEPTED', total_counts: 4983 },
            { stat: 'BLACK', total_counts: 18 },
            { stat: 'DELIVRD', total_counts: 81194 },
            { stat: 'EXPIRED', total_counts: 370 },
            { stat: 'INVALID', total_counts: 8 },
            { stat: 'Pending', total_counts: 9 },
            { stat: 'REJECTD', total_counts: 424 },
            { stat: 'REJECTED', total_counts: 30 },
            { stat: 'UNDELIV', total_counts: 17127 }
        ]
    },
    today_voice: {
        total_submission: null,
        total_credit_used: null
    },
    today_whatsapp: {
        total_submission: '684',
        total_credit_used: '234.1350'
    }
}

const toNumber = (value: MetricValue): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

const formatMetric = (value: MetricValue): string => formatIndianNumberWithDecimals(toNumber(value))

const calculatePercent = (part: number, total: number): number => {
    if (!total) return 0
    return Math.min(100, Math.max(0, (part / total) * 100))
}

const formatStatus = (status: string): string => {
    const map: Record<string, string> = {
        DELIVRD: 'Delivered',
        REJECTD: 'Rejected',
        UNDELIV: 'Undelivered'
    }
    return map[status] ?? status
}

const ModernDashboard = () => {
    const [dashboard, setDashboard] = useState<DashboardData>(FALLBACK_DATA)
    const [loading, setLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const fetchDashboard = (fresh = false) => {
        loadDashboard({
            loading: setLoading,
            page: 1,
            perPage: 15,
            jsonData: {
                user_id: '',
                yesterday: '',
                today: '',
                fresh: fresh ? 'Yes' : ''
            },
            success: (response: { data?: DashboardData }) => {
                if (response?.data) {
                    setDashboard(response.data)
                }
                setLastUpdated(new Date())
            }
        })
    }

    useEffect(() => {
        fetchDashboard()
    }, [])

    const statusData = [...(dashboard.today_sms.status_wise || [])].sort((a, b) => b.total_counts - a.total_counts)
    const creditSeries = [
        toNumber(dashboard.credit_info.transaction),
        toNumber(dashboard.credit_info.promotional),
        toNumber(dashboard.credit_info.two_waysms),
        toNumber(dashboard.credit_info.voice_sms),
        toNumber(dashboard.credit_info.whatsapp)
    ]
    const submissionToday = [
        toNumber(dashboard.today_sms.total_submission),
        toNumber(dashboard.today_voice.total_submission),
        toNumber(dashboard.today_whatsapp.total_submission)
    ]
    const submissionTillYesterday = [
        toNumber(dashboard.till_yesterday_sms.total_sent),
        toNumber(dashboard.till_yesterday_voice.total_sent),
        toNumber(dashboard.till_yesterday_whatsapp.total_sent)
    ]

    const smsDeliveredPct = calculatePercent(
        toNumber(dashboard.till_yesterday_sms.total_delivered),
        Math.max(toNumber(dashboard.till_yesterday_sms.total_sent), 1)
    )
    const smsFailedPct = calculatePercent(
        toNumber(dashboard.till_yesterday_sms.total_failed),
        Math.max(toNumber(dashboard.till_yesterday_sms.total_sent), 1)
    )
    const waDeliveredPct = calculatePercent(
        toNumber(dashboard.till_yesterday_whatsapp.total_delivered),
        Math.max(toNumber(dashboard.till_yesterday_whatsapp.total_sent), 1)
    )
    const waReadPct = calculatePercent(
        toNumber(dashboard.till_yesterday_whatsapp.total_read),
        Math.max(toNumber(dashboard.till_yesterday_whatsapp.total_sent), 1)
    )

    const statusChartOptions: ApexOptions = {
        chart: { toolbar: { show: false }, parentHeightOffset: 0 },
        colors: ['#0ea5e9'],
        plotOptions: { bar: { borderRadius: 6, distributed: true, columnWidth: '60%' } },
        dataLabels: { enabled: false },
        xaxis: {
            categories: statusData.map((item) => formatStatus(item.stat)),
            labels: { rotate: -30 }
        },
        legend: { show: false },
        yaxis: { labels: { formatter: (value) => formatIndianNumberWithDecimals(Number(value)) } },
        grid: { borderColor: '#f1f5f9' }
    }

    const creditChartOptions: ApexOptions = {
        labels: ['Transactional', 'Promotional', 'Two Way', 'Voice', 'WhatsApp'],
        chart: { type: 'donut' },
        dataLabels: { enabled: false },
        legend: { position: 'bottom' },
        stroke: { width: 0 },
        colors: ['#2563eb', '#0ea5e9', '#f59e0b', '#ef4444', '#22c55e'],
        responsive: [{ breakpoint: 1200, options: { chart: { height: 320 } } }]
    }

    const submissionChartOptions: ApexOptions = {
        chart: { stacked: false, toolbar: { show: false }, parentHeightOffset: 0 },
        stroke: { width: [0, 0], curve: 'smooth' },
        colors: ['#1d4ed8', '#14b8a6'],
        plotOptions: { bar: { columnWidth: '45%', borderRadius: 8 } },
        dataLabels: { enabled: false },
        xaxis: { categories: ['SMS', 'Voice', 'WhatsApp'] },
        yaxis: { labels: { formatter: (value) => formatIndianNumberWithDecimals(Number(value)) } },
        legend: { position: 'top' },
        grid: { borderColor: '#f1f5f9' }
    }

    const kpiCards = [
        {
            title: 'Total Users',
            value: formatMetric(dashboard.credit_info.total_users),
            subtitle: 'Active customer base',
            icon: <Users size={18} />,
            color: '#2563eb'
        },
        {
            title: 'Transactional Credit',
            value: formatMetric(dashboard.credit_info.transaction),
            subtitle: 'Available SMS wallet',
            icon: <Zap size={18} />,
            color: '#0ea5e9'
        },
        {
            title: 'Today SMS Submission',
            value: formatMetric(dashboard.today_sms.total_submission),
            subtitle: 'Live message intake',
            icon: <MessageCircle size={18} />,
            color: '#14b8a6'
        },
        {
            title: 'Today WhatsApp Submission',
            value: formatMetric(dashboard.today_whatsapp.total_submission),
            subtitle: 'Business messaging load',
            icon: <WhatsApp fontSize='small' />,
            color: '#22c55e'
        }
    ]

    return (
        <div className='modern-dashboard-revamp'>
            <Header icon={<DashboardRounded fontSize='medium' />} title='Command Center' subHeading={null}>
                <ButtonGroup>
                    <Button color='primary' size='sm' onClick={() => fetchDashboard()}>
                        <RefreshCw size={14} className='me-50' />
                        Refresh
                    </Button>
                    <Button color='info' size='sm' outline onClick={() => fetchDashboard(true)}>
                        Fresh Pull
                    </Button>
                </ButtonGroup>
            </Header>

            <Row className='match-height'>
                <Col xl='8' lg='7'>
                    <Card
                        className='mb-2 border-0 mdr-hero-card'
                    >
                        <CardBody className='py-2'>
                            <div className='d-flex flex-wrap justify-content-between align-items-start gap-1'>
                                <div>
                                    <h3 className='text-white mb-50'>Realtime Messaging Intelligence</h3>
                                    <p className='mb-1 mdr-hero-subtitle' style={{ maxWidth: 620 }}>
                                        Unified pulse for SMS, Voice and WhatsApp with live submissions, delivery quality and credit utilization.
                                    </p>
                                    <div className='d-flex flex-wrap gap-1'>
                                        <Badge className='mdr-chip' color='light-primary'>Today SMS Credit: {formatMetric(dashboard.today_sms.total_credit_used)}</Badge>
                                        <Badge className='mdr-chip' color='light-info'>Today WhatsApp Credit: {formatMetric(dashboard.today_whatsapp.total_credit_used)}</Badge>
                                        <Badge className='mdr-chip' color='light-success'>WhatsApp Wallet: {formatMetric(dashboard.credit_info.whatsapp)}</Badge>
                                    </div>
                                </div>
                                <div className='text-end'>
                                    <small className='d-block mb-50'>Last Updated</small>
                                    <h6 className='text-white mb-0'>
                                        {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Waiting for first sync'}
                                    </h6>
                                    {loading ? <Spinner size='sm' color='light' className='mt-1' /> : null}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col xl='4' lg='5'>
                    <Card className='mb-2 border-0 mdr-health-card'>
                        <CardBody>
                            <div className='d-flex align-items-center justify-content-between mb-1'>
                                <h5 className='text-white mb-0'>Delivery Health</h5>
                                <TrendingUp size={18} />
                            </div>
                            <div className='mb-1'>
                                <div className='d-flex justify-content-between mb-50'>
                                    <span>SMS Delivered</span>
                                    <span>{smsDeliveredPct.toFixed(1)}%</span>
                                </div>
                                <Progress color='success' value={smsDeliveredPct} />
                            </div>
                            <div className='mb-1'>
                                <div className='d-flex justify-content-between mb-50'>
                                    <span>WhatsApp Delivered</span>
                                    <span>{waDeliveredPct.toFixed(1)}%</span>
                                </div>
                                <Progress color='info' value={waDeliveredPct} />
                            </div>
                            <div className='mb-0'>
                                <div className='d-flex justify-content-between mb-50'>
                                    <span>WhatsApp Read</span>
                                    <span>{waReadPct.toFixed(1)}%</span>
                                </div>
                                <Progress color='primary' value={waReadPct} />
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <Row className='match-height'>
                {kpiCards.map((card) => (
                    <Col xl='3' md='6' sm='12' key={card.title}>
                        <Card className='mb-2 border-0 mdr-kpi-card'>
                            <CardBody>
                                <div className='d-flex justify-content-between align-items-start mb-1'>
                                    <div className='rounded p-50 mdr-kpi-icon' style={{ backgroundColor: `${card.color}1A`, color: card.color }}>
                                        {card.icon}
                                    </div>
                                    <Badge className='mdr-live-pill' color='light-secondary'>
                                        <Activity size={12} className='me-25' />
                                        Live
                                    </Badge>
                                </div>
                                <h2 className='mb-25 mdr-kpi-value'>{card.value}</h2>
                                <h6 className='mb-25'>{card.title}</h6>
                                <small className='text-muted'>{card.subtitle}</small>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className='match-height'>
                <Col xl='8' lg='7'>
                    <Card className='border-0 mb-2 mdr-chart-card'>
                        <CardHeader>
                            <CardTitle tag='h4'>Today SMS Status Distribution</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <Chart
                                type='bar'
                                height={320}
                                options={statusChartOptions}
                                series={[
                                    {
                                        name: 'Messages',
                                        data: statusData.map((item) => toNumber(item.total_counts))
                                    }
                                ]}
                            />
                        </CardBody>
                    </Card>
                </Col>
                <Col xl='4' lg='5'>
                    <Card className='border-0 mb-2 mdr-chart-card'>
                        <CardHeader>
                            <CardTitle tag='h4'>Credit Split by Channel</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <Chart type='donut' height={320} options={creditChartOptions} series={creditSeries} />
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <Row className='match-height'>
                <Col xl='7' lg='6'>
                    <Card className='border-0 mb-2 mdr-chart-card'>
                        <CardHeader>
                            <CardTitle tag='h4'>Submission Comparison</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <Chart
                                type='bar'
                                height={290}
                                options={submissionChartOptions}
                                series={[
                                    { name: 'Today Submission', data: submissionToday },
                                    { name: 'Till Yesterday Sent', data: submissionTillYesterday }
                                ]}
                            />
                        </CardBody>
                    </Card>
                </Col>
                <Col xl='5' lg='6'>
                    <Card className='border-0 mb-2 mdr-chart-card'>
                        <CardHeader>
                            <CardTitle tag='h4'>Quality Signals</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className='mb-2'>
                                <div className='d-flex justify-content-between mb-50'>
                                    <span>SMS Failure Ratio</span>
                                    <span>{smsFailedPct.toFixed(1)}%</span>
                                </div>
                                <Progress color='danger' value={smsFailedPct} />
                            </div>
                            <div className='mb-2'>
                                <div className='d-flex justify-content-between mb-50'>
                                    <span>SMS Blocked Numbers</span>
                                    <span>{formatMetric(dashboard.till_yesterday_sms.total_block_number)}</span>
                                </div>
                                <Progress color='warning' value={Math.min(toNumber(dashboard.till_yesterday_sms.total_block_number), 100)} />
                            </div>
                            <div className='mb-0'>
                                <div className='d-flex justify-content-between mb-50'>
                                    <span>SMS Invalid Numbers</span>
                                    <span>{formatMetric(dashboard.till_yesterday_sms.total_invalid_number)}</span>
                                </div>
                                <Progress color='secondary' value={Math.min(toNumber(dashboard.till_yesterday_sms.total_invalid_number), 100)} />
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col xs='12'>
                    <Card className='border-0 mdr-chart-card mdr-table-card'>
                        <CardHeader>
                            <CardTitle tag='h4'>Channel Snapshot</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className='table-responsive'>
                                <table className='table align-middle mb-0 mdr-table'>
                                    <thead>
                                        <tr>
                                            <th>Channel</th>
                                            <th>Today Submission</th>
                                            <th>Till Yesterday Sent</th>
                                            <th>Till Yesterday Delivered</th>
                                            <th>Till Yesterday Failed</th>
                                            <th>Credit Used</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>SMS</td>
                                            <td>{formatMetric(dashboard.today_sms.total_submission)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_sms.total_sent)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_sms.total_delivered)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_sms.total_failed)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_sms.total_credit_used)}</td>
                                        </tr>
                                        <tr>
                                            <td>Voice</td>
                                            <td>{formatMetric(dashboard.today_voice.total_submission)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_voice.total_sent)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_voice.total_delivered)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_voice.total_failed)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_voice.total_credit_used)}</td>
                                        </tr>
                                        <tr>
                                            <td>WhatsApp</td>
                                            <td>{formatMetric(dashboard.today_whatsapp.total_submission)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_whatsapp.total_sent)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_whatsapp.total_delivered)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_whatsapp.total_failed)}</td>
                                            <td>{formatMetric(dashboard.till_yesterday_whatsapp.total_credit_used)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default ModernDashboard
