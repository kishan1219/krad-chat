// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Download, RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import { JsonToTable } from '@components/json-to-table'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, CardHeader, CardTitle, Col, Input, Row } from 'reactstrap'
import Hide from '../../../utility/Hide'
import Show from '../../../utility/Show'
import { twoWayResponseLog } from '../../../utility/apis/report'
import useUser from '../../../utility/hooks/useUser'
import FormGroupCustom from '../../components/formGroupCustom'
import BsPopover from '../../components/popover'
import Shimmer from '../../components/shimmers/Shimmer'
import BsTooltip from '../../components/tooltip'
import ExportResponse from './ExportResponse'

const TwoWayResponseReport = ({ edit, activeTab }) => {
    const loginUser = useUser()
    const [open, setOpen] = useState(false)
    const responseClicks = useSelector(a => a.report.report)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [list, setList] = useState(null)
    const users = useSelector(state => state.auth.userData)
    const dispatch = useDispatch()
    // const [currentPage, setCurrentPage] = useState("1")
    const [formVisible, setFormVisible] = useState(false)
    const [reload, setReload] = useState(false)
    const [clickReport, setClickReport] = useState(null)
    const form = useForm()
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    // const [rowsPerPage, setRowsPerPage] = useState("2")
    const [perPage, setPerPage] = useState(15)
    const [id, setId] = useState(null)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        send_sms_id: edit?.id,
        search: ""
    })
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [modal, setModal] = useState(false)

    const handleModal = () => setModal(!modal)

    const handleShow = () => {
        reset()
        setOpen(!open)

        if (edit === null) setEditData(null)

    }

    useEffect(() => {
        setId(edit?.id)
    }, [edit])

    const preload = () => {
        twoWayResponseLog({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: {

            },
            loading: setLoading,
            jsonData: {

                ...filterData,
                search: filterData?.search
            }
        })
    }

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    useEffect(() => {
        if (activeTab === '4') {
            preload()
        }
    }, [filterData, activeTab])

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        twoWayResponseLog({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setClickReport,
            dispatch,
            loading: setLoading
        })
    }


    const clickColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Title",
            selector: 'title',
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Mobile Number",
            selector: 'mobile_num',
            sortable: true,
            minWidth: '100px'
        },
        {
            name: "Integrate Form",
            selector: row => {
                if (row.take_response === 0) { return 'None' }
                if (row.take_response === 1) { return 'Interest' }
                if (row.take_response === 2) { return 'Feedback/Contact' }
                if (row.take_response === 3) { return 'Rating' }

            },
            sortable: true,
            minWidth: '110px'
        },


        {
            name: "Link Expired",
            selector: 'link_expired',
            sortable: true,
            minWidth: '100px'
        },
        {
            name: "Code",
            selector: 'code',
            sortable: true,
            minWidth: '350px'
        },

        {
            name: "Clicks",
            cell: (row, index) => {
                if (row?.take_response === 1) {
                    return (
                        <>
                            <Hide IF={row?.total_click === 0}>
                                <BsTooltip role="button" className="me-1" title={null} >
                                    <BsPopover className='not-important' placement='right' trigger='hover' title={row?.total_click} content={
                                        <div style={{ overflow: "scroll", height: '450px' }}>
                                            {row?.two_way_comm_interests?.map((item, index) => {
                                                return (
                                                    <span className='text-wrap' >
                                                        {/* {JSON.stringify(item)} */}
                                                        <JsonToTable json={item} />
                                                    </span>
                                                )
                                            }
                                            )}
                                        </div>
                                    }>
                                        <span className='text-primary'>{row?.total_click}</span>
                                    </BsPopover>
                                </BsTooltip>
                            </Hide>
                            <Show IF={row?.total_click === 0}>
                                <span className='text-primary'>{row?.total_click}</span>
                            </Show>

                        </>
                    )
                } else if (row?.take_response === 2) {
                    return (
                        <>
                            <Hide IF={row?.total_click === 0}>
                                <BsTooltip role="button" className="me-1" title={null} >
                                    <BsPopover className='not-important' placement='right' trigger='hover' title={row?.total_click} content={
                                        <div style={{ overflow: "scroll", height: '450px' }}>
                                            {row?.two_way_comm_feedbacks?.map((item, index) => {
                                                return (
                                                    <span className='text-wrap' >
                                                        {/* {JSON.stringify(item)} */}
                                                        <JsonToTable json={item} />
                                                    </span>
                                                )
                                            }
                                            )}
                                        </div>
                                    }>
                                        <span className='text-primary'>{row?.total_click}</span>
                                    </BsPopover>
                                </BsTooltip>
                            </Hide>
                            <Show IF={row?.total_click === 0}>
                                <span className='text-primary'>{row?.total_click}</span>
                            </Show>

                        </>
                    )
                } else if (row?.take_response === 3) {
                    return (
                        <>
                            <Hide IF={row?.total_click === 0}>
                                <BsTooltip role="button" className="me-1" title={null} >
                                    <BsPopover className='not-important' placement='right' trigger='hover' title={row?.total_click} content={
                                        <div style={{ overflow: "scroll", height: '450px' }}>
                                            {row?.two_way_comm_ratings?.map((item, index) => {
                                                return (
                                                    <span className='text-wrap' >
                                                        {/* {JSON.stringify(item)} */}
                                                        <JsonToTable json={item} />
                                                    </span>
                                                )
                                            }
                                            )}
                                        </div>
                                    }>
                                        <span className='text-primary'>{row?.total_click}</span>
                                    </BsPopover>
                                </BsTooltip>
                            </Hide>
                            <Show IF={row?.total_click === 0}>
                                <span className='text-primary'>{row?.total_click}</span>
                            </Show>

                        </>
                    )
                }
            },
            sortable: true,
            maxWidth: '120px'
        }


    ]

    const CustomPagination = () => {
        const count = Math.ceil(responseClicks?.total / responseClicks?.per_page)
        return (
            <ReactPaginate
                initialPage={responseClicks?.current_page - 1}
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
            <Card className='border'>

                <CardHeader className='border-bottom inline'>
                    <CardTitle className='text-primary' tag='h4'>Two Way Click Log</CardTitle>
                    <ButtonGroup>
                        <Button.Ripple size="sm" color="dark" onClick={() => handleModal()}>
                            <Download size="14" on /> Export Report
                        </Button.Ripple>
                        <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => {
                            setFilterData({
                                ...filterData,
                                search: ''
                            }); setReload(true)
                        }} >
                            <RefreshCcw size="14" />
                        </Button.Ripple>

                    </ButtonGroup>
                </CardHeader>
                <Row className='justify-content-end mx-0'>
                    <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>
                        <FormGroupCustom
                            name={"search"}
                            type={"text"}
                            errors={errors}
                            label="Search"
                            noLabel

                            onChangeValue={(v) => {

                                setFilterData({
                                    ...filterData,
                                    search: v
                                })
                            }}
                            setValue={setValue}
                            className="mb-2"
                            control={control}
                        />
                    </Col>
                </Row>
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
                                // selectableRows
                                pagination
                                paginationServer
                                className='react-dataTable'
                                // expandableRows
                                // expandOnRowClicked
                                columns={clickColumn}
                                noDataComponent={<div className="nodata-class fw-bold" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                // expandableRowsComponent={ExpandableTable}
                                paginationComponent={CustomPagination}
                                data={responseClicks?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>}

            </Card>
            <ExportResponse
                edit={edit}
                handleModal={handleModal}
                setModal={setModal}
                modal={modal}
            />
        </>
    )
}

export default TwoWayResponseReport
