// @ts-nocheck
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch } from 'react-redux'
import { Button, Card, Col, Form, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { createAsyncSelectOptions, formatDate, minusDay } from '../../utility/Utils'
import { dailyReport } from '../../utility/apis/adminOperation'
import { loadPrimaryRoute } from '../../utility/apis/primaryRoutes'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'

const DailyReport = () => {
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
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const [report, setReport] = useState(null)
    const [primaryRoute, setPrimaryRoute] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())

    const dispatch = useDispatch()

    const preload = () => {
        dailyReport({
            page: currentPage,
            perPage: rowsPerPage,
            success: (e) => {
                setReport(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                submission_date: watch("submission_date"),
                sms_gateway: filterData?.sms_gateway
            }
        })
    }

    useEffect(() => {
        preload()
    }, [filterData])


    const listPrimaryRoute = async (search, loadedOptions, { page }) => {

        const res = await loadPrimaryRoute({
            async: true,
            page,
            perPage: 25,
            jsonData: { search }
        })
        return createAsyncSelectOptions(res, page, "route_name", "id", setPrimaryRoute)

    }
    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])


    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

    }

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        dailyReport({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // dispatch,
            success: setReport,
            loading: setLoading
        })
    }
    const dailyReportColumn = [

        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Route",
            selector: (row) => (row?.primary_route?.route_name ?? 'N/A'),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Date",
            selector: r => r.submission_date,
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "submission",
            selector: (row) => (row?.submission ?? 'N/A'),
            sortable: true,
            minWidth: '215px'
        },
        {
            name: "Credit Used",
            selector: (row) => (row?.submission_credit_used ?? 'N/A'),
            sortable: true,
            minWidth: '260px'
        },


        {
            name: "Auto Submission",
            selector: (row) => (row?.auto_submission ?? 'N/A'),
            sortable: true,
            minWidth: '215px'
        },
        {
            name: "Auto Submission Credit",
            selector: (row) => (row?.auto_submission_credit ?? 'N/A'),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Overall Delivered",
            selector: (row) => (row?.overall_delivered ?? 'N/A'),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Overall Delivered Credit",
            selector: (row) => (row?.overall_delivered_credit ?? 'N/A'),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Actual Delivered",
            selector: (row) => (row?.actual_delivered ?? 'N/A'),
            sortable: true,
            minWidth: '260px'

        },
        {
            name: "Actual Delivered Credit",
            selector: (row) => (row?.actual_delivered_credit ?? 'N/A'),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Other Than Delivered",
            selector: (row) => (row?.other_than_delivered ?? 'N/A'),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Other Than Delivered Credit",
            selector: (row) => (row?.other_than_delivered_credit ?? 'N/A'),
            sortable: true,
            minWidth: '260px'
        }

    ]

    const CustomPagination = () => {
        const count = Math.ceil(report?.data?.total / report?.data?.per_page)
        return (
            <ReactPaginate
                initialPage={report?.data?.current_page - 1}
                disableInitialCallback
                previousLabel={''}
                nextLabel={''}
                breakLabel='...'
                pageCount={count}
                activeClassName='active'
                onPageChange={page => handlePagination(page)}
                pageClassName={'page-item'}
                nextLinkClassName={'page-link'}
                nextClassName={'page-item next'}
                previousClassName={'page-item prev'}
                previousLinkClassName={'page-link'}
                pageLinkClassName={'page-link'}
                breakClassName='page-item'
                breakLinkClassName='page-link'
                containerClassName={
                    'pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
                }
            />

        )
    }
    const BootstrapCheckbox = forwardRef((props, ref) => (
        <div className='form-check'>
            <Input type='checkbox' innerRef={ref} {...props} />
        </div>
    ))
    return (
        <>
            <Header icon={""} title={"Daily Report"}>
                <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => {
                    setFilterData({
                        ...filterData,
                        submission_date: "",
                        sms_gateway: ""
                    }); setReload(true); setResetIt(new Date()); reset()
                }}>
                    <RefreshCcw size="14" />
                </Button.Ripple>
            </Header>

            <Card>
                <Form onSubmit={handleSubmit(submitFilter)}>
                    <Row className='justify-content-start mx-0'>
                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>

                            <FormGroupCustom
                                key={resetIt}
                                noLabel
                                //   defaultOptions
                                async
                                control={control}
                                type={"select"}
                                errors={errors}
                                name={"sms_gateway"}
                                // isMulti
                                isClearable

                                className='mb-1'
                                loadOptions={listPrimaryRoute}
                                options={primaryRoute}
                                //   options={createConstSelectOptions(actionFor)}
                                placeholder="Select Primary Route"
                                label="Route Type"
                                rules={{ required: false }}
                            />
                        </Col>

                        <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                            <FormGroupCustom
                                key={resetIt}
                                noLabel
                                defaultOptions
                                control={control}
                                name={"submission_date"}
                                type={"date"}
                                errors={errors}
                                options={{
                                    minDate: formatDate(new Date(
                                        minusDay(
                                            new Date(), 30
                                        )
                                    ))
                                }}

                                label={"To"}
                                dateFormat={"YYYY-MM-DD"}
                                setValue={setValue}
                                isClearable
                                className='mb-1'
                                placeholder="Select Date"

                            />

                        </Col>
                        <Col className='d-flex align-items-center justify-content-center ' md='2' sm='12'>
                            <LoadingButton loading={loading} type='submit' className='btn-icon' color='primary' block>
                                <span className='align-middle ms-25'>Search</span>
                            </LoadingButton>
                        </Col>
                    </Row>
                </Form>
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
                    <div className='card-datatable app-user-list table-responsive'>
                        <div className='react-dataTable'>

                            <DataTable
                                noHeader
                                //   selectableRows
                                pagination
                                paginationServer
                                className='react-dataTable'
                                columns={dailyReportColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={report?.data?.data}
                            //   onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }
            </Card>
        </>
    )
}

export default DailyReport
