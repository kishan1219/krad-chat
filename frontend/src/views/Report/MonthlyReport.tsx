// @ts-nocheck
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import QueryStats from '@mui/icons-material/QueryStats'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/charts/apex-charts.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useContext, useEffect, useState } from 'react'
import { Download, RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, Col, Form, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { Months, getYearList } from '../../utility/Const'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { convertSnakeToPlainText, createAsyncSelectMultiUserOptions, createConstSelectOptions } from '../../utility/Utils'
import { loadUserChild } from '../../utility/apis/userManagement'
import { monthlyReport } from '../../utility/apis/userWiseReport'
import { formatIndianNumber, isValid, isValidArray, log } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import FilterMonthlyReport from './FilterMonthlyReport'
import MonthlyReportChart from './MonthlyReportChart'
import MonthlyReportChart2 from './MonthlyReportChart2'

const MonthlyReport = () => {
    const { colors } = useContext(ThemeColors)
    const loginUser = useSelector(state => state.auth.userData)

    const [loading, setLoading] = useState(false)
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        getValues,
        setError
    } = useForm()
    const [showFilter, setShowFilter] = useState(false)
    const [currentPage, setCurrentPage] = useState("")
    const [rowsPerPage] = useState("")
    const [downloadPdf, setDownloadPdf] = useState(false)
    const reportData = useSelector(state => state.userWiseReport?.userWiseReport)
    const [filterData, setFilterData] = useState({
        per_page_record: "",
        generate_pdf: '',
        user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : watch('user_id') ?? "",
        month: watch('month') ?? "",
        year: watch('year') ?? ""
    })

    const [user, setUser] = useState(null)
    const [report, setReport] = useState(null)
    const [reload, setReload] = useState(false)
    const [pdfExport, setPdfExport] = useState(null)
    const [primaryRoute, setPrimaryRoute] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const dispatch = useDispatch()
    const handleButton = () => {
        setDownloadPdf(true)
    }

    const preload = () => {
        monthlyReport({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            error: (e) => {
                // setError("email", { message: e?.data?.payload?.email[0] ?? 'djkdsl' })
            },
            success: (e) => {
                setReport(e)
                // if (downloadPdf) {
                //     window.open(`${httpConfig?.baseUrl2}${e?.data?.file_path}`, 'target=_blank')
                // }
                // setDownloadPdf(false)
                setPdfExport(`${httpConfig?.baseUrl2}${e?.data?.file_path}`, 'target=_blank')


            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                generate_pdf: 'yes'
            }
        })
    }

    log(pdfExport, "pfdExport")

    const handleExport = () => {

        window.open(pdfExport, 'target=_blank')
    }

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    useEffect(() => {
        if (isValid(watch('year')) && isValid(watch('month'))) {
            preload()
        }
    }, [filterData])

    const loadUserData = async (search, loadedOptions, { page }) => {

        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)
    }

    const submitFilter = (d) => {
        setFilterData({
            ...d
        })
    }

    const renderStats = () => {
        const res = []
        {
            report?.data?.data?.map((e, i) => {
                const keys = Object.keys(e)
                // log("keys", keys)
                const re = []
                // loop through the keys and render the stats
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    const value = e[key]
                    // log("key", key)
                    // log("value", value)
                    // log("convertSnakeToPlainText", convertSnakeToPlainText(key))
                    if (key === 'id') continue
                    if (key === 'user_id') continue
                    if (key === 'group_name') continue
                    if (key === 'month') continue
                    if (key === 'year') continue
                    if (key === 'created_at') continue
                    if (key === 'updated_at') continue
                    // if (key === 'group_name') continue
                    if (typeof value === "object") continue


                    const color = 'white'
                    let backgroundColor = '#df7203'
                    if (key === 'sms_count_submission' || key === 'sms_count_delivered' || key === 'sms_count_failed' || key === 'sms_count_rejected' || key === 'sms_count_invalid') {
                        backgroundColor = '#494440'
                    }
                    re.push(
                        <Col lg='3' sm='12'>

                            <StatsHorizontal stats={isValid(value) ? formatIndianNumber(parseInt(value)) : 0} statTitle={convertSnakeToPlainText(key)} style={{ backgroundColor, color }} />
                        </Col>
                    )
                }
                res.push({
                    data: re,
                    group: e.group_name
                })
                // log("res", res)
            })
        }
        return res.map(e => {
            return (<Row className='mt-1'>
                <Col lg='12' sm='12' className='p-1 fw-bolder'>
                    <h3 className='fw-bolder'>{e?.group}</h3>
                </Col>
                {e?.data}
            </Row>
            )

        })
    }

    return (
        <>

            <Header icon={''} title="Monthly Report">
                <ButtonGroup>

                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                    {/* <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="dark" id="filteree" onClick={() => { setShowFilter(true) }}>
                        <Sliders size="14" />
                    </Button.Ripple> */}
                </ButtonGroup>
            </Header>


            <Card className='border p-1' >


                <Form onSubmit={handleSubmit(submitFilter)}>
                    <Row className='justify-content-start mx-0'>

                        <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2}>

                            <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                                <FormGroupCustom
                                    key={resetIt}
                                    noLabel
                                    async
                                    setValue={setValue}
                                    control={control}
                                    type={"select"}
                                    errors={errors}
                                    placeholder="Select User"
                                    name={"user_id"}
                                    isClearable
                                    className='mb-1'
                                    loadOptions={loadUserData}
                                    options={user}
                                    label="User"
                                    rules={{ required: true }}

                                />
                            </Col>
                        </Hide>
                        <Show IF={loginUser?.userType === 1 || loginUser?.userType === 2}>
                            <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>

                                <Input
                                    type='text'
                                    value={loginUser?.name}
                                    disabled
                                    className="mb-1"
                                />
                            </Col>
                        </Show>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                type={"select"}
                                control={control}
                                name="month"
                                noLabel
                                placeholder={"Select Month"}
                                isClearable
                                className='mb-1'
                                label="Month"
                                errors={errors}
                                // label={FM("vacation-trip")}
                                options={createConstSelectOptions(Months)}
                                rules={{ required: true }}
                            />
                        </Col>

                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>

                            <FormGroupCustom
                                type={"select"}
                                control={control}
                                name="year"
                                noLabel
                                isClearable
                                placeholder={"Select Year"}
                                className='mb-1'
                                label="Year"
                                errors={errors}
                                // label={FM("vacation-trip")}
                                options={getYearList()}
                                rules={{ required: true }}

                            />
                        </Col>

                        <Col className='d-flex align-items-center justify-content-center ' md='2' sm='12'>
                            <LoadingButton loading={loading} type='submit' className='btn-icon' color='primary' block>
                                <span className='align-middle ms-25'>Search</span>
                            </LoadingButton>
                        </Col>
                        <Show IF={isValidArray(report?.data?.data)}>
                            <Col className='d-flex align-items-center justify-content-center ' md='1' sm='12'>
                                <LoadingButton loading={loading} onClick={() => { handleExport() }} className='btn-icon' color='success' block>
                                    <span className='align-middle ms-25'><Download size={'16'} /></span>
                                </LoadingButton>
                            </Col>
                        </Show>

                    </Row>
                </Form>

            </Card>

            <Show IF={isValidArray(report?.data?.data)}>
                {/* <Row className='mt-1'>
                    <Col lg='3' sm='12' md="3" className='p-1 '>
                        <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={report?.data?.overall_total?.total_credit_deduct} statTitle={'Credit Deducted'} />

                    </Col>
                    <Col lg='3' sm='12' md="3" className='p-1 '>
                        <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={report?.data?.overall_total?.total_submission} statTitle={'Total Submission'} />

                    </Col>
                    <Col lg='3' sm='12' md="3" className='p-1 '>
                        <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={report?.data?.overall_total?.total_delivered} statTitle={'Total Delivered'} />

                    </Col>
                    <Col lg='3' sm='12' md="3" className='p-1 '>
                        <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={report?.data?.overall_total?.total_failed} statTitle={'Total Failed'} />

                    </Col>
                    <Col lg='3' sm='12' md="3" className='p-1 '>
                        <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={report?.data?.overall_total?.total_rejected} statTitle={'Total Rejected'} />

                    </Col>
                    <Col lg='3' sm='12' md="3" className='p-1 '>
                        <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={report?.data?.overall_total?.total_invalid} statTitle={'Total InValid'} />

                    </Col>


                </Row> */}


                {((isValidArray(report?.data?.overall_totals) ? report?.data?.overall_totals : isValidArray(report?.data?.overall_total) ? report?.data?.overall_total : []))?.map((total, index, array) => (
                    <div key={index} className={`mb-2 ${index !== array.length - 1 ? 'border-bottom pb-2' : ''}`}>
                        {total?.message_type ? (
                            <Row className='mt-1'>
                                <Col lg='12' sm='12' className='p-1 fw-bolder'>
                                    <h3 className='fw-bolder text-primary text-capitalize'>{total?.message_type}</h3>
                                </Col>
                            </Row>
                        ) : null}
                        <Row className='mt-1'>

                            <Col lg='12' sm='12' className='p-1 fw-bolder'>
                                <h3 className='fw-bolder'>SMS Count</h3>
                            </Col>
                            {/* <Col lg='3' sm='12' md="3" className='p-1 '>
                            <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={total?.sms_count_submission} statTitle={'Credit Deducted'} />

                        </Col> */}
                            <Col lg='3' sm='12' md="3" className='p-1 '>
                                <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={isValid(total?.sms_count_submission) ? formatIndianNumber(parseInt(total?.sms_count_submission)) : 0} statTitle={'Total Submission'} />

                            </Col>
                            <Col lg='3' sm='12' md="3" className='p-1 '>
                                <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={isValid(total?.sms_count_delivered) ? formatIndianNumber(parseInt(total?.sms_count_delivered)) : 0} statTitle={'Total Delivered'} />

                            </Col>
                            <Col lg='3' sm='12' md="3" className='p-1 '>
                                <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={isValid(total?.sms_count_failed) ? formatIndianNumber(parseInt(total?.sms_count_failed)) : 0} statTitle={'Total Failed'} />

                            </Col>
                            <Col lg='3' sm='12' md="3" className='p-1 '>
                                <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={isValid(total?.sms_count_rejected) ? formatIndianNumber(parseInt(total?.sms_count_rejected)) : 0} statTitle={'Total Rejected'} />

                            </Col>
                            <Col lg='3' sm='12' md="3" className='p-1 '>
                                <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={isValid(total?.sms_count_invalid) ? formatIndianNumber(parseInt(total?.sms_count_invalid)) : 0} statTitle={'Total InValid'} />

                            </Col>


                        </Row>
                        <Row className='mt-1'>

                            <Col lg='12' sm='12' className='p-1 fw-bolder'>
                                <h3 className='fw-bolder'>Mobile Count</h3>
                            </Col>
                            {/* <Col lg='3' sm='12' md="3" className='p-1 '>
                            <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={total?.sms_count_submission} statTitle={'Credit Deducted'} />

                        </Col> */}
                            <Col lg='3' sm='12' md="3" className='p-1 '>
                                <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={isValid(total?.mobile_count_submission) ? formatIndianNumber(parseInt(total?.mobile_count_submission)) : 0} statTitle={'Total Submission'} />

                            </Col>
                            <Col lg='3' sm='12' md="3" className='p-1 '>
                                <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={isValid(total?.mobile_count_delivered) ? formatIndianNumber(parseInt(total?.mobile_count_delivered)) : 0} statTitle={'Total Delivered'} />

                            </Col>
                            <Col lg='3' sm='12' md="3" className='p-1 '>
                                <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={isValid(total?.mobile_count_failed) ? formatIndianNumber(parseInt(total?.mobile_count_failed)) : 0 } statTitle={'Total Failed'} />

                            </Col>
                            <Col lg='3' sm='12' md="3" className='p-1 '>
                                <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={isValid(total?.mobile_count_rejected) ? formatIndianNumber(parseInt(total?.mobile_count_rejected)) : 0} statTitle={'Total Rejected'} />

                            </Col>
                            <Col lg='3' sm='12' md="3" className='p-1 '>
                                <StatsHorizontal icon={<QueryStats fontSize='medium' />} color='success' stats={isValid(total?.mobile_count_invalid) ? formatIndianNumber(parseInt(total?.mobile_count_invalid)) : 0} statTitle={'Total InValid'} />

                            </Col>


                        </Row>
                    </div>
                ))}

                {/* <Card className='mt-1'> */}
                {/* <ApexBarChart  info={colors.info.main} /> */}
                <br />
                <Row>
                    <Col md='6' sm='12'>

                        <MonthlyReportChart info={colors.info.main} reportData={report?.data?.data} />

                    </Col>
                    <Col md='6' sm='12'>

                        <MonthlyReportChart2 info={colors.info.main} reportData={report?.data?.data} />

                    </Col>
                </Row>
                <br />
                {renderStats()}
                {/* <StatsHorizontal icon={<SettingsVoice fontSize='medium' />} color='success' stats={report[0]?.total_delivered ?? 0} statTitle={"Today's Voice Credit Used"} /> */}

            </Show>

            <Show IF={isValid(report?.data)}>
                <Show IF={!isValidArray(report?.data?.data)}>

                    <Card className='mt-2'>
                        <Col lg='12' sm='12' md="12" className='p-1 '>
                            <h3 className='fw-bolder text-center'>No Data Found</h3>
                        </Col>
                    </Card>
                </Show>
            </Show>
            {/* </Card> */}
            <FilterMonthlyReport show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />
        </>
    )
}

export default MonthlyReport
