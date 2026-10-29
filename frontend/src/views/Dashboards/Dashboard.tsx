// @ts-nocheck
/* eslint-disable no-mixed-operators */
import Avatar from '@components/avatar'
import { useContext, useEffect, useState } from 'react'
import { Codesandbox, RefreshCcw, User } from 'react-feather'
// ** Styles
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { Stop } from '@mui/icons-material'
import Api from '@mui/icons-material/Api'
import CurrencyRupee from '@mui/icons-material/CurrencyRupee'
import Dashboardd from '@mui/icons-material/Dashboard'
import Dns from '@mui/icons-material/Dns'
import Http from '@mui/icons-material/Http'
import Markunread from '@mui/icons-material/Markunread'
import Php from '@mui/icons-material/Php'
import PublishedWithChanges from '@mui/icons-material/PublishedWithChanges'
import Refreshes from '@mui/icons-material/Refresh'
import Replay30 from '@mui/icons-material/Replay30'
import Sensors from '@mui/icons-material/Sensors'
import SettingsVoice from '@mui/icons-material/SettingsVoice'
import WhatsApp from '@mui/icons-material/WhatsApp'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/charts/apex-charts.scss'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonGroup, Card, CardBody, CardHeader, CardTitle, Col, Row, UncontrolledTooltip } from 'reactstrap'
import { loadDashboard } from '../../utility/apis/dashboard'
import { getServerDetails } from '../../utility/apis/report'
import { formatIndianNumber, formatIndianNumberWithDecimals, isValid, log } from '../../utility/helpers/common'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { formatDate, minusDay } from '../../utility/Utils'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import CpuThread from './CpuThread'
import HddUsage from './HddUsage'
import RamUsage from './RamUsage'
import Status from './Status'
import VoiceStatus from './VoiceStatus'
import WhatsappStatus from './WhatsappStatus'

// ** Styles

// load stats till yesterday

const Dashboard = props => {
    const context = useContext(ThemeColors)
    const [refresh, setRefresh] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)
    const [loadings, setLoadings] = useState(false)

    // const dashboards = useSelector(a => a.dashboard.dashboard)
    // const stats = useSelector(a => a.report.report)
    const [stats, setStats] = useState({
        cpu_usage_percentage: "",
        hd_usage_percentage: "",
        ram_usage_percentage: ""
    })
    const [dashboards, setDashboard] = useState({
        total_users: "",
        total_sent: "",
        total_delivered: "",
        total_failed: "",
        total_block_number: "",
        total_invalid_number: "",
        total_process: "",
        credit_info: {
            transaction: "",
            promotional: "",
            two_waysms: "",
            voice_sms: ""
        }
    })
    const [data, setData] = useState(null)
    const [list, setList] = useState(null)
    const [viewDashboard, setViewDashboard] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage, setRowsPerPage] = useState("2")
    const [loading, setLoading] = useState(false)
    const [rowsSelected, setRowsSelected] = useState([])
    const [refreshButton, setRefreshButton] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })

    const handleView = () => {
        setViewDashboard(true)
    }

    const [page, setPage] = useState(1)
    const dispatch = useDispatch()

    const navigator = useNavigate()

    const preload = (data) => {
        loadDashboard({
            page,
            perPage: rowsPerPage,
            // dispatch,
            success: (e) => {
                // setTemplate(e)
                setDashboard({ ...e?.data })
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                user_id: "",
                yesterday: "",
                today: "",
                fresh: !refreshButton ? "" : "Yes"

            }
        })
    }

    const serverInfo = (data) => {
        getServerDetails({
            // dispatch,
            success: (e) => {
                setStats(e?.data)
            },
            loadings: setLoadings
        })
    }
    useEffect(() => {
        preload()
        if (viewDashboard) {
            preload()
        }
        if (loginUser?.userType === 0) {
            serverInfo()
        }
    }, [filterData, viewDashboard])

    useEffect(() => {
        if (refreshButton === true) {
            preload()
        }
    }, [refreshButton])

    useEffect(() => {
        const refresher = setInterval(() => {
            if (refresh) {
                preload()
                if (loginUser?.userType === 0) {
                    serverInfo()
                }
            }
        }, 30000)
        log(refresh, "refresh")

        return () => {
            clearInterval(refresher)
        }
    }, [refresh])

    // log("dash", dashboards)

    const options = {
        labels: ['Total', 'Failed', 'Invalid'],
        plotOptions: {
            radialBar: {
                size: 150,
                hollow: {
                    size: '20%'
                },
                track: {
                    strokeWidth: '100%',
                    margin: 15
                },
                dataLabels: {
                    value: {
                        fontSize: '1rem',
                        colors: '#5e5873',
                        fontWeight: '500',
                        offsetY: 5
                    },
                    total: {
                        show: true,
                        label: 'Total',
                        fontSize: '1.286rem',
                        colors: '#5e5873',
                        fontWeight: '500'

                    }
                }
            }
        },
        colors: [context.colors.primary.main, context.colors.warning.main, context.colors.danger.main],
        stroke: {
            lineCap: 'round'
        },
        chart: {
            height: 355,
            dropShadow: {
                enabled: true,
                blur: 3,
                left: 1,
                top: 1,
                opacity: 0.1
            }
        }
    }
    const series = [parseFloat(dashboards?.total_delivered ?? 0), parseFloat(dashboards?.total_failed ?? 0), parseFloat(dashboards?.total_invalid_number ?? 0)]

    const sendToCommandPage = () => {
        navigator('/server-commands')
    }

    const getFullStatusName = (status) => {
        switch (status) {
            case "ACCEPTED":
                return "Accepted"
            case "DELIVRD":
                return "Delivered"
            case "FAILED":
                return "Failed"
            case "Pending":
                return "Pending"
            case "REJECTD":
                return "Rejected"
            case "UNDELIV":
                return "Undelivered"
            default:
                return status
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "ACCEPTED":
                return "info"
            case "DELIVRD":
                return "success"
            case "FAILED":
                return "danger"
            case "REJECTD":
                return "secondary"
            case "UNDELIV":
                return "dark" 
            case "Pending":
                return "warning"
            default:
                return "primary"
        }
    }

    return (
        <>

            <Header icon={<Dashboardd size="25" />} title="Dashboard" >
                {/* Tooltips */}

                <ButtonGroup color='dark' className='me-25'>


                    <UncontrolledTooltip target="dashboard">Refresh Dashboard</UncontrolledTooltip>
                    <UncontrolledTooltip target="fixedTime">{!refresh ? 'Click here to Refresh Data in Every 30 Second' : 'Stop Automatic Refresh'}</UncontrolledTooltip>
                    <UncontrolledTooltip target="fresh">Get Fresh Record</UncontrolledTooltip>
                    <Show IF={loginUser?.userType === 0}>
                        <UncontrolledTooltip target="code">Server Commands</UncontrolledTooltip>
                        <Button.Ripple size="sm" color="primary" id="code" onClick={sendToCommandPage}>
                            <Codesandbox size="14" />
                            {/* <TouchAppIcon  /> */}
                        </Button.Ripple>

                        <UncontrolledTooltip target="server">Refresh Server</UncontrolledTooltip>
                        <Button.Ripple size="sm" color="secondary" id="server" onClick={serverInfo}>
                            <RefreshCcw size="14" />
                            {/* <TouchAppIcon  /> */}
                        </Button.Ripple>

                    </Show>

                    <Button.Ripple size="sm" color="dark" id="dashboard" onClick={preload}>
                        <Refreshes fontSize='small' />
                    </Button.Ripple>

                    <Button.Ripple size="sm" color="info" id="fixedTime" onClick={() => { setRefresh(!refresh) }}>
                        {!refresh ? <Replay30 fontSize='small' /> : <Stop fontSize='small' />}
                    </Button.Ripple>

                    <Button.Ripple size="sm" color="danger" id="fresh" onClick={() => { setRefreshButton(!refreshButton) }}>
                        <PublishedWithChanges fontSize='small' />
                    </Button.Ripple>

                </ButtonGroup>

            </Header>

            {loginUser?.account_type === 1 ? <>

                <Row>

                    {loadings ? <>
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />

                    </> : <>

                        <Show IF={loginUser?.userType === 0}>

                            <Col lg="4" md="6" sm="12">
                                <CpuThread key={stats?.cpu_threads} stats={stats} />
                            </Col>
                            <Col lg="4" md="6" sm="12">
                                <HddUsage key={stats?.cpu_threads} stats={stats} />
                            </Col>
                            <Col lg="4" md="6" sm="12">
                                <RamUsage key={stats?.cpu_threads} stats={stats} />
                            </Col>


                            <Col lg='3' sm='6'>
                                <StatsHorizontal icon={<Sensors size={21} />} color='success' stats={stats?.established_connections ?? 0} statTitle={" Established Connections"} />
                            </Col>
                            <Col lg='3' sm='6'>
                                <StatsHorizontal icon={<Sensors size={21} />} color='success' stats={stats?.total_connections ?? 0} statTitle={" Total Connections"} />
                            </Col>
                            <Col lg='3' sm='6'>
                                <StatsHorizontal icon={<Http size={21} />} color='success' stats={stats?.total_http_connections ?? 0} statTitle={" Total HTTP Connections"} />
                            </Col>


                            <Col lg='3' sm='6'>
                                <StatsHorizontal icon={<Php size={21} />} color='success' stats={stats?.php_load_gb ?? 0} statTitle={"Php Load in Gb"} />
                            </Col>
                            <Col lg='4' sm='6'>
                                <StatsHorizontal icon={<Php size={21} />} color='success' stats={stats?.php_version ?? 0} statTitle={"Php Version"} />
                            </Col>
                            <Col lg='4' sm='6'>
                                <StatsHorizontal icon={<Dns size={21} />} color='success' stats={stats?.server_addr ?? 0} statTitle={"Server Address"} />
                            </Col>
                            <Col lg='4' sm='6'>
                                <StatsHorizontal icon={<Dns size={21} />} color='success' stats={stats?.server_name ?? 0} statTitle={"Server Name"} />
                            </Col>
                            <div>
                                {/* <br /> */}
                                <hr style={{ marginTop: '5px', marginBottom: '25px' }} />
                                {/* <br /> */}
                            </div>

                        </Show>
                    </>}
                    <Hide IF={viewDashboard}>
                        <Col md="3" className="d-flex justify-content-end ms-auto">

                            <Button onClick={handleView} color="primary">Click to Load stats till Yesterday</Button>
                        </Col>
                    </Hide>
                    <Hide IF={!viewDashboard}>
                        {loading ? <>
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />

                        </> : <>
                            <Col lg='4' sm='6'>
                                <StatsHorizontal icon={<Markunread fontSize='medium' />} color='success' stats={isValid(dashboards?.today_sms?.total_submission) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.today_sms?.total_submission)) : 0} statTitle={"Today's SMS Submission"} />
                            </Col>

                            <Col lg='4' sm='6'>
                                <StatsHorizontal icon={<Markunread fontSize='medium' />} color='success' stats={isValid(dashboards?.today_sms?.total_credit_used) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.today_sms?.total_credit_used)) : 0} statTitle={"Today's SMS Credit Used"} />
                            </Col>

                            <Col lg='4' sm='6'>
                                <StatsHorizontal icon={<SettingsVoice fontSize='medium' />} color='success' stats={isValid(dashboards?.today_voice?.total_submission) ? dashboards?.today_voice?.total_submission : 0} statTitle={"Today's Voice Submission"} />
                            </Col>

                            <Col lg='4' sm='6'>
                                <StatsHorizontal icon={<SettingsVoice fontSize='medium' />} color='success' stats={isValid(dashboards?.today_voice?.total_credit_used) ? dashboards?.today_voice?.total_credit_used : 0} statTitle={"Today's Voice Credit Used"} />
                            </Col>

                            <Col lg='4' sm='6'>
                                <StatsHorizontal icon={<WhatsApp fontSize='medium' />} color='success' stats={isValid(dashboards?.today_whatsapp?.total_submission) ? dashboards?.today_whatsapp?.total_submission : 0} statTitle={"Today's Whatsapp Submission"} />
                            </Col>

                            <Col lg='4' sm='6'>
                                <StatsHorizontal icon={<WhatsApp fontSize='medium' />} color='success' stats={isValid(dashboards?.today_whatsapp?.total_credit_used) ? dashboards?.today_whatsapp?.total_credit_used : 0} statTitle={"Today's Whatsapp Credit Used"} />
                            </Col>

                            <div className='divider divider-primary'>
                                <div className='divider-text fw-bolder'><h3 className='fw-bolder'>Today status wise sms count</h3></div>
                            </div>
                            {dashboards?.today_sms?.status_wise?.map((data, index) => (
                                <Col lg='4' sm='6' key={index}>
                                    <StatsHorizontal icon={<Markunread fontSize='medium' />} color={'white'} cardColor={getStatusColor(data?.stat)} stats={data?.total_counts} statTitle={getFullStatusName(data?.stat)} />
                                </Col>
                            ))}

                            <Col lg="3" md="6" sm="12">
                                {/* <Row> */}
                                <Card className='card-transaction p-0'>
                                    <CardHeader className=''>
                                        <CardTitle tag='h4'>
                                            Credit Info
                                        </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <div className='transaction-item d-flex justify-content-between'>
                                            <div className='d-flex'>
                                                <Avatar className='rounded' color={"light-success"} icon={<CurrencyRupee size={18} />} style={{ marginRight: "10px" }} />
                                                <div className='ml-2'>
                                                    <h6 className='transaction-titles mb-0'>Transactional</h6>
                                                    <small className='fw-bolder text-success'> {isValid(dashboards?.credit_info?.transaction) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.transaction)) : 0} </small>
                                                </div>
                                            </div>
                                            {/* <div className='fw-bolder text-success'> {dashboards?.credit_info?.transaction} </div> */}
                                        </div>

                                        <div className='transaction-item d-flex justify-content-between mt-1'>
                                            <div className='d-flex'>
                                                <Avatar className='rounded' color={"light-info"} icon={<SettingsVoice size={18} />} style={{ marginRight: "10px" }} />
                                                <div className='ml-2'>
                                                    <h6 className='transaction-title'>Voice</h6>
                                                    <small className='fw-bolder text-info'> {isValid(dashboards?.credit_info?.voice_sms) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.voice_sms)) : 0} </small>
                                                </div>
                                            </div>
                                            {/* <div className='fw-bolder text-info' > {dashboards?.credit_info?.voice_sms} </div> */}
                                        </div>

                                        <div className='transaction-item d-flex justify-content-between mt-1'>
                                            <div className='d-flex'>
                                                <Avatar className='rounded ml-2' color={"light-primary"} icon={<Api size={18} />} style={{ marginRight: "10px" }} />
                                                <div className='ml-2'>
                                                    <h6 className='transaction-title'>Promotional</h6>
                                                    <small className='fw-bolder text-primary'> {isValid(dashboards?.credit_info?.promotional) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.promotional)) : 0} </small>
                                                </div>
                                            </div>
                                            {/* <div className='fw-bolder text-primary'> {dashboards?.credit_info?.promotional} </div> */}
                                        </div>

                                        <div className='transaction-item d-flex justify-content-between mt-1'>
                                            <div className='d-flex'>
                                                <Avatar className='rounded ml-2' color={"light-warning"} icon={<Sensors size={18} />} style={{ marginRight: "10px" }} />
                                                <div className='ml-2'>
                                                    <h6 className='transaction-title'>Two-Way</h6>
                                                    <small className='fw-bolder text-warning'> {isValid(dashboards?.credit_info?.two_waysms) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.two_waysms)) : 0} </small>
                                                </div>
                                            </div>
                                            {/* <div className='fw-bolder text-warning'> {dashboards?.credit_info?.two_waysms} </div> */}
                                        </div>
                                        <div className='transaction-item d-flex justify-content-between mt-1'>
                                            <div className='d-flex'>
                                                <Avatar className='rounded ml-2' color={"light-success"} icon={<WhatsApp fontSize='medium' />} style={{ marginRight: "10px" }} />
                                                <div className='ml-2'>
                                                    <h6 className='transaction-title'>WhatsApp</h6>
                                                    <small className='fw-bolder text-warning'>{isValid(dashboards?.credit_info?.whatsapp) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.whatsapp)) : 0} </small>
                                                </div>
                                            </div>
                                            {/* <div className='fw-bolder text-warning'> {dashboards?.credit_info?.whatsapp} </div> */}
                                        </div>

                                    </CardBody>

                                    <CardHeader className=''>
                                        <CardTitle tag='h4'>
                                            Other Info
                                        </CardTitle>
                                    </CardHeader>

                                    <CardBody>
                                        <Hide IF={loginUser?.userType === 2}>
                                            <div className='transaction-item d-flex justify-content-between'>
                                                <div className='d-flex'>
                                                    <Avatar className='rounded' color={"light-success"} icon={<User size={18} />} style={{ marginRight: "10px" }} />
                                                    <div className='ml-2'>
                                                        <h6 className='transaction-titles mb-0'>User</h6>
                                                        <small className='fw-bolder text-success'>{isValid(dashboards?.credit_info?.total_users) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.total_users)) : 0}  </small>
                                                    </div>
                                                </div>
                                                {/* <div className='fw-bolder text-success'> {dashboards?.total_users} </div> */}
                                            </div>
                                        </Hide>
                                        {/* \ */}
                                    </CardBody>
                                </Card>
                                {/* </Row> */}
                            </Col>

                            <Col lg="3" md="6" sm="12">
                                <Status key={dashboards?.cpu_threads} dashboards={dashboards}
                                    title={"SMS Submission"}

                                    success={context.colors.success.main}
                                    warning={context.colors.warning.main}
                                    danger={context.colors.danger.main}
                                    info={context.colors.info.main}
                                    secondary={context.colors.secondary.main}
                                />
                            </Col>
                            <Col lg="3" md="6" sm="12">
                                <VoiceStatus key={dashboards?.cpu_threads} dashboards={dashboards}
                                    title={"Voice Submission"}
                                    success={context.colors.success.main}
                                    warning={context.colors.warning.main}
                                    danger={context.colors.danger.main}
                                    info={context.colors.info.main}
                                    secondary={context.colors.secondary.main}
                                />
                            </Col>
                            <Col lg="3" md="6" sm="12">
                                <WhatsappStatus key={dashboards?.cpu_threads} dashboards={dashboards}
                                    title={"Whatsapp Submission"}
                                    success={context.colors.success.main}
                                    warning={context.colors.warning.main}
                                    danger={context.colors.danger.main}
                                    info={context.colors.info.main}
                                    secondary={context.colors.secondary.main}
                                    progress={context.colors.primary.main}
                                    dark={context.colors.dark.main}
                                />
                            </Col>

                            {/* <Col lg="3" md="3" sm="6">
                    <Status key={dashboards?.cpu_threads} dashboards={{
                        total_users: 0,
                        total_sent: 0,
                        total_delivered: 0,
                        total_process: 0,
                        total_invalid_number: 0,
                        total_failed: 0,
                        total_delivered: 0,
                        total_block_number: 0,
                        total_process: 0,
                        credit_info: {
                            transaction: 0,
                            promotional: 0,
                            two_waysms: 0,
                            voice_sms: 0
                        }
                    }}
                        title={"Voice SMS Status"}
                        success={context.colors.success.main}
                        warning={context.colors.warning.main}
                        danger={context.colors.danger.main}
                        info={context.colors.info.main}
                        secondary={context.colors.secondary.main}
                    />


                </Col> */}

                            {/* <Col lg="3" md="3" sm="6">
                    <Status key={dashboards?.cpu_threads} dashboards={{
                        total_users: 0,
                        total_sent: 0,
                        total_delivered: 0,
                        total_failed: 0,
                        total_block_number: 0,
                        total_invalid_number: 0,
                        total_process: 0,
                        credit_info: {
                            transaction: 0,
                            promotional: 0,
                            two_waysms: 0,
                            voice_sms: 0
                        }
                    }}
                        title={"Whatsapp Status"}
                        success={context.colors.success.main}
                        warning={context.colors.warning.main}
                        danger={context.colors.danger.main}
                        info={context.colors.info.main}
                        secondary={context.colors.secondary.main}
                    />


                </Col> */}
                        </>}
                    </Hide>
                </Row>
            </> : <>
                {loading ? <>
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                    <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />

                </> : <>
                      
                    <div className='divider divider-primary'>
                        <div className='divider-text fw-bolder'><h3 className='fw-bolder'>Today's Submission({formatDate(new Date(), 'YYYY-MM-DD')})</h3></div>
                    </div>
                    <Row>
                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<Markunread fontSize='medium' />} color='success' stats={isValid(dashboards?.today_sms?.total_submission) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.today_sms?.total_submission)) : 0} statTitle={"SMS Submission"} />
                        </Col>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<Markunread fontSize='medium' />} color='success' stats={isValid(dashboards?.today_sms?.total_credit_used) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.today_sms?.total_credit_used)) : 0} statTitle={"SMS Credit Used"} />
                        </Col>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<SettingsVoice fontSize='medium' />} color='success' stats={isValid(dashboards?.today_voice?.total_submission) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.today_voice?.total_submission)) : 0} statTitle={"Voice Submission"} />
                        </Col>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<SettingsVoice fontSize='medium' />} color='success' stats={isValid(dashboards?.today_voice?.total_credit_used) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.today_voice?.total_credit_used)) : 0} statTitle={"Voice Credit Used"} />
                        </Col>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<WhatsApp fontSize='medium' />} color='success' stats={isValid(dashboards?.today_whatsapp?.total_submission) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.today_whatsapp?.total_submission)) : 0} statTitle={"Whatsapp Submission"} />
                        </Col>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<WhatsApp fontSize='medium' />} color='success' stats={isValid(dashboards?.today_whatsapp?.total_credit_used) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.today_whatsapp?.total_credit_used)) : 0} statTitle={"Whatsapp Credit Used"} />
                        </Col>
                        {dashboards?.today_sms?.status_wise?.map((data, index) => (
                            <Col lg='4' sm='6' key={index}>
                                <StatsHorizontal icon={<Markunread fontSize='medium' />} color={'white'} cardColor={getStatusColor(data?.stat)} stats={data?.total_counts} statTitle={getFullStatusName(data?.stat)} />
                            </Col>
                        ))}

                        <div className='divider divider-primary'>
                            <div className='divider-text fw-bolder'><h3 className='fw-bolder'>Submission Till {formatDate(minusDay(new Date(), 1), 'YYYY-MM-DD')} </h3></div>
                        </div>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<Markunread fontSize='medium' />} color='success' stats={isValid(dashboards?.till_yesterday_sms?.total_sent) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.till_yesterday_sms?.total_sent)) : 0} statTitle={"SMS Sent"} />
                        </Col>
                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<Markunread fontSize='medium' />} color='success' stats={isValid(dashboards?.till_yesterday_sms?.total_credit_used) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.till_yesterday_sms?.total_credit_used)) : 0} statTitle={"SMS Credit Used"} />
                        </Col>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<SettingsVoice fontSize='medium' />} color='success' stats={isValid(dashboards?.till_yesterday_voice?.total_sent) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.till_yesterday_voice?.total_sent)) : 0} statTitle={"Voice Sent"} />
                        </Col>
                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<SettingsVoice fontSize='medium' />} color='success' stats={isValid(dashboards?.till_yesterday_voice?.total_credit_used) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.till_yesterday_voice?.total_credit_used)) : 0} statTitle={"Voice Credit Used"} />
                        </Col>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<WhatsApp fontSize='medium' />} color='success' stats={isValid(dashboards?.till_yesterday_whatsapp?.total_sent) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.till_yesterday_whatsapp?.total_sent)) : 0} statTitle={"Whatsapp Sent"} />
                        </Col>
                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<WhatsApp fontSize='medium' />} color='success' stats={isValid(dashboards?.till_yesterday_whatsapp?.total_credit_used) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.till_yesterday_whatsapp?.total_credit_used)) : 0} statTitle={"Whatsapp Credit Used"} />
                        </Col>


                        <div className='divider divider-primary'>
                            <div className='divider-text fw-bolder'><h3 className='fw-bolder'>Credit Info</h3></div>
                        </div>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<CurrencyRupee size={18} />} color='success' stats={isValid(dashboards?.credit_info?.transaction) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.transaction)) : 0} statTitle={"Transactional"} />
                        </Col>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<Api size={18} />} color='success' stats={isValid(dashboards?.credit_info?.promotional) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.promotional)) : 0} statTitle={"Promotional"} />
                        </Col>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<Sensors size={18} />} color='success' stats={isValid(dashboards?.credit_info?.two_waysms) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.two_waysms)) : 0} statTitle={"Two Ways"} />
                        </Col>
                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<SettingsVoice fontSize='medium' />} color='success' stats={isValid(dashboards?.credit_info?.voice_sms) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.voice_sms)) : 0} statTitle={"Voice"} />
                        </Col>

                        <Col lg='4' sm='6'>
                            <StatsHorizontal icon={<WhatsApp fontSize='medium' />} color='success' stats={isValid(dashboards?.credit_info?.whatsapp) ? formatIndianNumberWithDecimals(parseFloat(dashboards?.credit_info?.whatsapp)) : 0} statTitle={"Whatsapp"} />
                        </Col>

                    </Row>

                </>}
            </>}

        </>
    )
}

export default Dashboard
