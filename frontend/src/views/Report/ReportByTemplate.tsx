// @ts-nocheck
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, RefreshCcw, Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, Col, Form, Input, Row, Table, UncontrolledTooltip } from 'reactstrap'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import { createAsyncSelectMultiUserOptions, createAsyncSelectOptions, formatDate, minusDay } from '../../utility/Utils'
import { startOrStopCampaign } from '../../utility/apis/campaign'
import { exportByID, messageReport, templateSummaryReport } from '../../utility/apis/report'
import { loadUserChild } from '../../utility/apis/userManagement'
import { FM, isValid, log } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import { loadGroup } from '../../utility/apis/templateGroup'
import classNames from 'classnames'
import { HourglassBottom } from '@mui/icons-material'
import Shimmer from '../components/shimmers/Shimmer'
import TableView from '@mui/icons-material/TableView'
import useUser from '../../utility/hooks/useUser'
import BsTooltip from '../components/tooltip'

const ReportByTemplate = () => {
    const [loading, setLoading] = useState(false)
    const [template, setTemplate] = useState(null)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        user_id: ""
    })
    const [resetIt, setResetIt] = useState(new Date())
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [group, setGroup] = useState(null)
    const [reload, setReload] = useState(false)
    const [reportType, setReportType] = useState(true)
    const user = useUser()

    const dispatch = useDispatch()

    const preload = (data) => {

        templateSummaryReport({
            perPage: 1000,
            // dispatch,
            // success: (e) => {
            //     setMessage(e)
            // },
            success: setTemplate,
            loading: setLoading,
            jsonData: {
                ...data,
                report: reportType === true ? 2 : 1

                // date: data?.date ? data?.date : formatDate(new Date(), "YYYY-MM-DD")
            }
        })
    }
    const submitFilter = (d) => {
        preload(d)

    }

    log(template, "template")

    const listTemplateGroup = async (search, loadedOptions, { page }) => {

        const res = await loadGroup({
            async: true,
            page,
            perPage: 25,
            jsonData: { search, user_id: watch("user_id") }
        })
        return createAsyncSelectOptions(res, page, "group_name", "id", setGroup)

    }

    // useEffect(() => {
    //     // if (isValid(watch("date"))) {
    //         preload()
    //     // }
    // }, [filterData])

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const renderTable = () => {
        const re = []
        const object = template
        log(object)
        let i = 1
        for (const key in object) {
            if (Object.hasOwnProperty.call(object, key)) {

                const element = object[key]?.length > 0 ? object[key][0] : null
                re.push(
                    <tr key={key}>
                        {/* <td>{i}</td> */}
                        <td className='fw-bolder'>{key}</td>
                        <td>{element?.total_submission ?? 'N/A'} </td>
                        <td>{element?.total_invalid_numbers ?? 'N/A'}</td>
                        <td>{element?.total_block_numbers ?? 'N/A'}</td>
                        <td>{element?.total_credit_used ?? 'N/A'}</td>

                    </tr>
                )
                i++

            }
        }
        // sort re by key
        re.sort((a, b) => {
            if (a.key > b.key) {
                return 1
            } else {
                return -1
            }
        })
        return re

    }

    const changeKey = (key) => {
        switch (key) {
            case "total_submission":
                return "Total Submission"
            case "total_invalid_numbers":
                return "Total Invalid Numbers"
            case "total_block_numbers":
                return "Total Block Numbers"
            case "total_credit_used":
                return "Total Credit Used"
            // case 'stat':
            //     return "Status"
            case "stat_wise_count":
                return "Total Submission"
            case "used_credit":
                return "Total Used Credit"
            case "group_name":
                return "Group"
            default:
                return key
        }
    }

    const renderTable2 = () => {
        const re = []
        const head = []
        const tableHeder = new Set()
        const footer = []
        template?.map((e, i) => {
            const td = []
            const object = e
            for (const key in object) {
                if (Object.hasOwnProperty.call(object, key)) {
                    const element = object[key] ?? 'N/A'

                    tableHeder.add(changeKey(key))

                    // get footer
                    const footerElement = footer.find(e => e.key === key)
                    if (footerElement) {
                        footerElement.value += Number(element)
                    } else {
                        footer.push({
                            key,
                            value: Number(element)
                        })
                    }
                    td.push(
                        <td key={key}>{element}</td>
                    )
                }
            }

            re.push(
                <tr key={i}>
                    {td}
                </tr>
            )
        })

        head.push(
            <thead key={re.length}>
                <tr>
                    {
                        [...tableHeder]?.map((e, i) => {
                            return (
                                <th key={i}>{(e)}</th>
                            )
                        }
                        )
                    }
                </tr>
            </thead>
        )
        if (re.length > 0) {
            re.push(
                <tr key={re.length} className='tfoot'>
                    {footer?.map((e, i) => {
                        if (e.key === "group_name") return <td key={i} className='fw-bolder'>Total</td>
                        return (
                            <td key={i} className='fw-bolder'>{isNaN(e?.value) ? "" : e?.value}</td>
                        )
                    })
                    }
                </tr>
            )
        } else {
            re.push(
                <tr key={re.length} className='tfoot'>
                    <td colSpan={5} className='fw-bolder text-center'>No Data</td>
                </tr>
            )
        }
        return [head, <tbody key={re.length}>{re}</tbody>]
    }
    return (
        <>
            <Header title={"Report By Template Group"} icon={<TableView />} >
                {/* <ButtonGroup>
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { preload() }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup> */}
            </Header>

            <Card>
                <Form onSubmit={handleSubmit(submitFilter)}>
                    <Row className='justify-content-start mx-0'>
                        
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                         
                            <FormGroupCustom
                                async
                                key={watch("user_id")}
                                label={"Template Group"}
                                type={"select"}
                                loadOptions={listTemplateGroup}
                                control={control}
                                placeholder={"Select Template Group"}
                                name="dlt_template_group_id"
                                isClearable
                                // isMulti
                                noLabel
                                className='mb-1'
                               
                                errors={errors}
                                options={group}
                                rules={{ required: false }}

                            />
                            
                        </Col>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                noLabel
                                defaultOptions
                                control={control}
                                name={"date"}
                                type={"date"}
                                errors={errors}
                                // defaultValue={formatDate(new Date(), "YYYY-MM-DD")}
                                // isDisable
                                value={watch('date') ?? formatDate(new Date(), "YYYY-MM-DD")}
                                options={{
                                    // enableTime: true,
                                    maxDate: new Date(`${formatDate(new Date(), "YYYY-MM-DD")} 00:00:00`)
                                }}
                                label={"To"}
                                dateFormat={"YYYY-MM-DD"}
                                setValue={setValue}
                                isClearable
                                className={classNames("mb-1")}
                                rules={{ required: true }}

                            />
                        </Col>
                        <Hide IF={user?.accountType === 2}>
                        <Show IF={user?.userType === 0 || user?.userType === 3}>
                            <Col className='d-flex align-items-center justify-content-center ' md='2' sm='12'>
                                {/* <LoadingButton loading={loading} type='submit' className='btn-icon' color='primary' block onClick={() => { setReportType(false) }}  >
                                    <span className='align-middle ms-25'>Complete Report</span>
                                </LoadingButton> */}
                                <Button.Ripple type='submit' className='btn-icon' color='primary' block onClick={() => { setReportType(false) }}  >
                                    <span className='align-middle ms-25'>Complete Report</span>
                                </Button.Ripple>
                            </Col>
                        </Show>
                        </Hide>
                        <Col className='d-flex align-items-center justify-content-center ' md='2' sm='12'>
                            {/* <LoadingButton loading={loading} type='submit' className='btn-icon' color='primary' block onClick={() => { setReportType(true) }}>
                                <span className='align-middle ms-25'>Submission Report</span>
                            </LoadingButton> */}
                            <Button.Ripple type='submit' className='btn-icon' color='primary' block onClick={() => { setReportType(true) }}>
                                <span className='align-middle ms-25'>Submission Report</span>
                            </Button.Ripple>
                        </Col>
                    </Row>
                </Form>
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

                        <Show IF={isValid(template)}>
                            <Table striped responsive className='summary_report'>
                                {renderTable2()}

                            </Table>
                        </Show>
                    </>
                    }
                </Row>
            </Card>
        </>
    )
}

export default ReportByTemplate
