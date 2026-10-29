// @ts-nocheck
import { RefreshCcw, Sliders } from 'react-feather'
import { Button, ButtonGroup, Card, CardBody, Col, Form, Input, Row, Table, UncontrolledTooltip } from 'reactstrap'
import Header from '../components/header'
import { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { detailedReportApi } from '../../utility/apis/report'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import { loadUserChild } from '../../utility/apis/userManagement'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions } from '../../utility/Utils'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { loadSenderIds } from '../../utility/apis/senderIds'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import FormGroupCustom from '../components/formGroupCustom'
import LoadingButton from '../components/buttons/LoadingButton'
import Shimmer from '../components/shimmers/Shimmer'
import ExportDetailedReport from './ExportDetailedReport'
import ExportDetailedSmsReport from './ExportDetailedSmsReport'

const DetailedReport = () => {
    const { colors } = useContext(ThemeColors)
    const loginUser = useSelector(state => state.auth.userData)
    const [report, setReport] = useState(null)
    const form = useForm()

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
    const [sender, setSender] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())

    const [currentPage, setCurrentPage] = useState("")
    const [loading, setLoading] = useState(false)
    const [reload, setReload] = useState(false)
    const [rowsPerPage] = useState("")
    const [user, setUser] = useState(null)
    const [filterData, setFilterData] = useState({
        user_id: "",
        from: '',
        to: "",
        sender_id: ""
    })

    const [exportReport, setExportReport] = useState(false)
    const [exportSmsReport, setExportSmsReport] = useState(false)

    const handleExportReport = () => {
        setExportReport(true)
    }
    const handleExportSmsReport = () => {
        setExportSmsReport(true)
    }


    const preload = () => {
        detailedReportApi({
            perPage: 1000,
            error: (e) => {
                // setError("email", { message: e?.data?.payload?.email[0] ?? 'djkdsl' })
            },
            success: (e) => {
                setReport(e?.data)
                // if (downloadPdf) {
                //     window.open(`${httpConfig?.baseUrl2}${e?.data?.file_path}`, 'target=_blank')
                // }
                // setDownloadPdf(false)
                // setPdfExport(`${httpConfig?.baseUrl2}${e?.data?.file_path}`, 'target=_blank')


            },
            loading: setLoading,
            jsonData: {
                ...filterData
                // generate_pdf: 'yes'
            }
        })
    }

    log(report, "detailed report")

    const listSenderID = async (search, loadedOptions, { page }) => {

        const res = await loadSenderIds({
            async: true,
            page,
            perPage: 25,
            jsonData: { search, user_id: loginUser?.userType === 1 || loginUser?.userType === 2 ? loginUser?.id : watch("user_id") }
        })
        return createAsyncSelectOptions(res, page, "sender_id", "sender_id", setSender)

    }

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    useEffect(() => {
        if (isValid(watch('from')) && isValid(watch('to'))) {
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

    return (
        <> <Header title={"Detailed Report"}  >
            {/* <ButtonGroup>
                <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { }} >
                    <RefreshCcw size="14" />
                </Button.Ripple>
            </ButtonGroup> */}

            {/* <ButtonGroup color='primary' className='me-25'>
                <Button.Ripple size="sm" color="primary" id="filter" onClick={() => handleExportReport()}>
                    <Sliders size="14" /> Export Report
                </Button.Ripple>
            </ButtonGroup> */}
            <ButtonGroup color='primary' className='me-25'>
                <Button.Ripple size="sm" color="primary" id="filter" onClick={() => handleExportSmsReport()}>
                    <Sliders size="14" /> Export SMS Report
                </Button.Ripple>
            </ButtonGroup>
        </Header>
            <Card className='border p-1' >


                <Form onSubmit={handleSubmit(submitFilter)}>
                    <Row className='justify-content-start mx-0'>

                        <Hide IF={loginUser?.userType === 1 || loginUser?.userType === 2}>

                            <Col md="2" xs="12" >
                                <FormGroupCustom
                                    key={resetIt}
                                    // noLabel
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
                                    label="Select User"
                                    rules={{ required: false }}

                                />
                            </Col>
                        </Hide>
                        {/* <Show IF={loginUser?.userType === 1 || loginUser?.userType === 2}>
                            <Col  md='2' sm='12'>

                                <Input
                                    type='text'
                                    value={loginUser?.name}
                                    disabled
                                    className="mb-1"
                                />
                            </Col>
                        </Show> */}
                        <Col md='2' sm='12'>
                            <FormGroupCustom
                                key={watch("user_id")}
                                async
                                loadOptions={listSenderID}
                                type={"select"}
                                control={control}
                                name="sender_id"
                                isClearable
                                className='mb-1'
                                label="Sender ID "
                                errors={errors}
                                options={sender}
                                // noLabel
                                rules={{ required: false }}

                            />
                        </Col>
                        <Col md='2' sm='12'>
                            <FormGroupCustom
                                name={"from"}
                                type={"date"}
                                errors={errors}
                                label={"From Date"}
                                options={{
                                    // enableTime: true,
                                    // minDate: Date.now()
                                }}
                                dateFormat={"YYYY-MM-DD"}
                                setValue={setValue}
                                className="mb-2"
                                // noLabel
                                control={control}
                                rules={{ required: true }}
                            // values={edit?.out_time}
                            />
                        </Col>

                        <Col md='2' sm='12'>

                            <FormGroupCustom
                                name={"to"}
                                type={"date"}
                                errors={errors}
                                // noLabel

                                label={"Upto Date"}
                                options={{
                                    // enableTime: true,
                                    minDate: watch("from")
                                }}
                                dateFormat={"YYYY-MM-DD"}
                                setValue={setValue}
                                className="mb-2"
                                control={control}
                                rules={{ required: true }}
                            // values={edit?.out_time}
                            />
                        </Col>
                        {/* <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>

                            <FormGroupCustom
                                name={"to"}
                                type={"date"}
                                errors={errors}
                                label={"To"}
                                options={{
                                    // enableTime: true,
                                    minDate: watch("from")
                                }}
                                dateFormat={"YYYY-MM-DD"}
                                setValue={setValue}
                                className="mb-2"
                                control={control}
                                rules={{ required: true }}
                            // values={edit?.out_time}
                            />
                        </Col> */}

                        <Col className='d-flex align-items-center justify-content-center ' md='2' sm='12'>
                            <LoadingButton loading={loading} type='submit' className='btn-icon' color='primary' block>
                                <span className='align-middle ms-25'>Search</span>
                            </LoadingButton>
                        </Col>


                    </Row>
                </Form>

            </Card>

            <Card>
                <Row className='mt-2'>
                    {loading ? <>
                        <Col md='12'>
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5, marginTop: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                            <Shimmer style={{ width: "100%", height: 50, marginBottom: 5 }} />
                        </Col>
                    </> : <>
                        <Show IF={isValid(report)}>
                            <Table striped responsive>
                                <thead>
                                    <tr>
                                        <th scope='col' className='text-nowrap'>
                                            #
                                        </th>
                                        <th scope='col' className='text-nowrap'>
                                            Error Code
                                        </th>
                                        <th scope='col' className='text-nowrap'>
                                            Description
                                        </th>
                                        <th scope='col' className='text-nowrap'>
                                            Total Count
                                        </th>
                                    </tr>
                                </thead>

                                {report?.map((item, index) => {
                                    return (
                                        <>
                                            <tbody>
                                                <tr>
                                                    <td className='text-nowrap' > {index + 1} </td>
                                                    <td className='text-nowrap'> {item?.err}</td>
                                                    <td className='text-nowrap'> {item?.description}</td>
                                                    <td className='text-nowrap'> {item?.total_count}</td>
                                                </tr>
                                            </tbody>
                                        </>
                                    )
                                })}

                            </Table>
                        </Show>
                    </>}

                    <Show IF={!isValid(report)}>
                        <CardBody className='text-center'>
                            No Record Found
                        </CardBody>
                    </Show>
                </Row>
            </Card>
            <ExportDetailedReport
                open={exportReport}
                toggle={() => setExportReport(!exportReport)}
            />
            <ExportDetailedSmsReport
                open={exportSmsReport}
                toggle={() => setExportSmsReport(!exportSmsReport)}
            />
        </>
    )
}

export default DetailedReport
