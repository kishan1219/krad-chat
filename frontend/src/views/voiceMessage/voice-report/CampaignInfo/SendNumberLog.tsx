// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import * as Icon from 'react-feather'
import { ChevronDown } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, CardHeader, CardTitle, Col, Form, Input, Row } from 'reactstrap'

import toast from 'react-hot-toast'
import useUser from '../../../../utility/hooks/useUser'
import { getVoiceCampaignInfo, resendThisVoiceSms } from '../../../../utility/apis/voiceSMS'
import { isValid, isValidArray } from '../../../../utility/helpers/common'
import { dlrExplainCode } from '../../../../utility/apis/campaign'
import BsTooltip from '../../../components/tooltip'
import Show from '../../../../utility/Show'
import FormGroupCustom from '../../../components/formGroupCustom'
import LoadingButton from '../../../components/buttons/LoadingButton'
import Shimmer from '../../../components/shimmers/Shimmer'

const SendNumberLog = ({ edit, activeTab }) => {

    const loginUser = useUser()
    const [open, setOpen] = useState(false)

    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [list, setList] = useState(null)
    const users = useSelector(state => state.auth.userData)
    const dispatch = useDispatch()
    const [currentPage, setCurrentPage] = useState("1")
    const [formVisible, setFormVisible] = useState(false)
    const [rowsPerPage] = useState("15")
    const form = useForm()
    const [perPage, setPerPage] = useState(15)
    const [id, setId] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        search: ""
    })
    const [reload, setReload] = useState(false)

    const [user, setUser] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form

    // const handleClose = (from = null) => {
    //     handleShow()
    // }
    const showForm = () => {
        setFormVisible(!formVisible)
    }

    const handleShow = () => {
        reset()
        setOpen(!open)

        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()

    }

    // log("logedit", edit)

    const onSubmitNew = () => {

    }

    // log("lisitng,", list)

    useEffect(() => {
        setId(edit?.id)
    }, [edit])


    const submitFilter = (d) => {
        setFilterData({
            ...d
            // filterData
        })
        // console.log(d)

    }

    const listCampaignInfo = (data) => {
        getVoiceCampaignInfo({
            id: edit?.id,
            page: currentPage,
            perPage: rowsPerPage,
            loading: setLoading,
            showS: !isValid(filterData?.search),
            jsonData: {
                ...filterData,
                search: filterData?.search
            },
            success: setList

        })
    }
    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    useEffect(() => {
        if (activeTab === '2') {
            listCampaignInfo()

        }

    }, [filterData, activeTab])

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        getVoiceCampaignInfo({
            id,
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            success: setList,
            loading: setLoading
        })
    }

    const handleReload = () => {
        getVoiceCampaignInfo()
    }

    const resendMessage = (row) => {
        resendThisVoiceSms({
            jsonData: {
                voice_sms_queue_id: row
            },
            success: (e) => {

            }
        })
    }

    const codeExplain = (row) => {
        dlrExplainCode({
            id: row?.err,
            // jsonData: {
            //     sms_queue_id: row
            // },
            success: (e) => {
                if (isValidArray(e?.data)) {
                    toast.success(e?.data[0]?.description)

                }
            }
        })
    }

    let columnn = []
    if (loginUser?.userType === 0 || loginUser?.userType === 3) {
        columnn = [

            {
                name: "#",
                cell: (row, index) => {
                    // return (filterData?.per_page_record * (page - 1)) + (index + 1)
                    return (rowsPerPage * (currentPage - 1)) + (index + 1)
                },
                maxWidth: "10px"
            },
            {
                name: "Mobile No.",
                // selector: 'mobile',
                cell: (row, index) => {
                    return (<> <div>
                        <span className='text-wrap'>{row.mobile}</span>
                        <br />
                        {/* <Show IF = {loginUser?.userType === 0 || loginUser?.userType === 3 }><Show IF={row?.is_auto === 1} > <span className='ml-1 text-primary btn btn-primary btn-sm ' style={{ cursor: 'pointer' }}> <Icon.Send size={"20"} onClick={() => { resendMessage(row?.id) }}  />Yes</span></Show></Show> */}
                        <Show IF={loginUser?.userType === 0 || loginUser?.userType === 3}><Show IF={row?.is_auto === 0} >  <Button.Ripple color="primary" onClick={() => { resendMessage(row?.id) }} size="sm" style={{ marginTop: "7px" }}> <Icon.Send size={"14"} />&nbsp; No </Button.Ripple> </Show></Show>
                        <Show IF={loginUser?.userType === 0 || loginUser?.userType === 3}><Show IF={row?.is_auto === 1} >  <Button.Ripple color="primary" onClick={() => { resendMessage(row?.id) }} size="sm" style={{ marginTop: "7px" }}> <Icon.Send size={"14"} />&nbsp; Yes </Button.Ripple>  </Show></Show>

                    </div> </>)
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Voice ID",
                cell: (row, index) => {
                    return (<><div><span className='text-wrap'>{row.voice_id}</span></div></>)
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Submit Date",
                cell: (row, index) => {
                    return (<><div><span className='text-wrap'>{row.submit_date}</span></div></>)
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Call Start",
                cell: (row, index) => {
                    return (<><div><span className='text-wrap'>{row.start_time}</span></div></>)
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Call End",
                cell: (row, index) => {
                    return (<><div><span className='text-wrap'>{row.end_time}</span></div></>)
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Call Duration",
                cell: (row, index) => {
                    return (<><div><span className='text-wrap'>{row.duration}</span></div></>)
                },
                sortable: true,
                minWidth: '170px'
            },


            // {
            //     name: "Delivery Time",
            //     selector: r => r.done_date,
            //     sortable: true,
            //     minWidth: '170px'
            // },
            {
                name: "Stats",
                cell: (row) => {

                    return <>
                        <Show IF={isValid(row?.err)}>
                            <span className='text-primary' style={{ cursor: 'pointer' }} onClick={() => { codeExplain(row) }} >
                                {row?.stat}</span>
                        </Show>
                        <Show IF={!isValid(row?.err)}>
                            <span className='text-primary'>
                                {row?.stat}</span>
                        </Show>
                    </>
                },
                sortable: true,
                minWidth: '170px'
            }

        ]
    } else {
        columnn = [

            {
                name: "#",
                cell: (row, index) => {
                    return (rowsPerPage * (currentPage - 1)) + (index + 1)
                },
                maxWidth: "10px"
            },
            {
                name: "Mobile No.",
                selector: r => r.mobile,

                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Message",
                cell: (row, index) => {
                    return (<span className='text-wrap'>{row.message}</span>)
                },
                sortable: true,
                minWidth: '400px'
            },
            {
                name: "User Credit",
                selector: r => r.use_credit,
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Done Date",
                selector: r => r.submit_date,
                sortable: true,
                minWidth: '170px'
            },
            {
                name: "Stats",
                selector: r => r.stat,
                sortable: true,
                minWidth: '170px'
            }

        ]
    }

    const campaignColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Mobile No.",
            selector: 'mobile',
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Message",
            cell: (row, index) => {
                return (<span className='text-wrap'>{row.message}</span>)
            },
            sortable: true,
            minWidth: '400px'
        },
        {
            name: "User Credit",
            selector: 'use_credit',
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Stats",
            selector: 'stat',
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Status",
            selector: 'status',
            sortable: true,
            minWidth: '170px'
        }

    ]

    const ExpandableTable = ({ data }) => {
        return (
            <div className='expandable-content p-2 border-bottom'>

                <b className='text-primary'> Message:</b>  {data?.message}
            </div>
        )
    }


    const CustomPagination = () => {
        const count = Math.ceil(list?.data?.total / list?.data?.per_page)
        return (
            <ReactPaginate
                initialPage={list?.data?.current_page - 1}
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
                    <CardTitle className='text-primary' tag='h4'>Send Numbers Final Report</CardTitle>
                    <ButtonGroup>
                        <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }}>
                            <Icon.RefreshCcw size="14" />
                        </Button.Ripple>
                    </ButtonGroup>
                </CardHeader>
                <Row className='justify-content-end mx-0'>
                    <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>

                        <Form onSubmit={e => e.preventDefault()}>

                            <FormGroupCustom
                                key={resetIt}
                                name={"search"}
                                type={"text"}
                                errors={errors}
                                label="Search"
                                noLabel
                                setValue={setValue}
                                className="mb-2"
                                control={control}
                                append={
                                    <>
                                        <LoadingButton
                                            onClick={() => {
                                                handleSubmit(submitFilter)()
                                            }}
                                            loading={loading}
                                            className="btn btn-primary"
                                            color="primary"
                                            // type="submit"
                                            size="sm"
                                        >
                                            <Icon.Search size={15} />
                                        </LoadingButton>
                                    </>
                                }
                            />
                        </Form>
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
                                columns={columnn}
                                noDataComponent={<div className="nodata-class fw-bold" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                // expandableRowsComponent={ExpandableTable}
                                paginationComponent={CustomPagination}
                                data={list?.data?.data}
                            // onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>}

            </Card>
            {/* </form> */}


        </>
    )
}

export default SendNumberLog
