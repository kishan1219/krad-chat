// @ts-nocheck
import SimCardDownload from '@mui/icons-material/SimCardDownload'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Download, Edit, Eye, RefreshCcw, Search, Sliders, Trash, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, ButtonGroup, Card, Col, Form, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { deleteCountry, loadCountry } from '../../utility/apis/countryCrud'
import { Permissions } from '../../utility/Permissions'
import Show from '../../utility/Show'
import ConfirmStop from '../../utility/helpers/ConfirmStop'
import Header from '../components/header'
import WhatsApp from '@mui/icons-material/WhatsApp'
import Shimmer from '../components/shimmers/Shimmer'
import FormGroupCustom from '../components/formGroupCustom'
import AddCountry from './AddCountry'
import LoadingButton from '../components/buttons/LoadingButton'
import FilterCountry from './FilterCountry'
import LanguageIcon from '@mui/icons-material/Language'

const CountryList = () => {
    const user = useSelector(state => state.auth.userData)
    const list = useSelector(state => state.country.country)
    const [showFilter, setShowFilter] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
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
    const [resetIt, setResetIt] = useState(new Date())
    const dispatch = useDispatch()
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const [reload, setReload] = useState(false)
    const preload = (data) => {
        loadCountry({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setDlr(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                search: filterData?.search
            }
        })
    }

    useEffect(() => {
        preload()
    }, [filterData])

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
    const deleteTheCountry = (row) => {
        deleteCountry({
            id: row,
            success: () => {
            }
        })
    }
    const countryColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Country",
          
            selector: r => (<>{r?.name} <span className='fw-bolder'>(+{r?.phonecode})</span></>),
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "ISO",
            selector: r => r?.iso,
            sortable: true,
            minWidth: '150px'
        },
        {
            name: "ISO3",
            selector: r => r?.iso3,
            sortable: true,
            minWidth: '150px'
        },
        {
            name: "Currency",
            selector: r => r?.currency,
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "Code",
            selector: r => (<>{r?.currency_code} <span className='fw-bolder'>(+{r?.currency_symbol})</span></>),
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "Min",
            selector: r => r?.min,
            sortable: true,
            minWidth: '140px'
        },
        {
            name: "Max",
            selector: r => r?.max,
            sortable: true,
            minWidth: '140px'
        },


        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (
                    <ButtonGroup>
                        <Show IF={Permissions?.adminOperation}>
                            {/* <UncontrolledTooltip placement='top' id='view' target='view'>
                                View
                            </UncontrolledTooltip> */}
                            {/* <ViewDlr Component={Button.Ripple} size="sm" color={"success"} edit={row} id="view"> <Eye size={15} /></ViewDlr> */}
                        </Show>
                        {/* <UncontrolledTooltip placement='top' id='edit' target='view'>
                            edit
                        </UncontrolledTooltip> */}
                        <Show IF={Permissions?.adminOperation}>
                            {/* <UncontrolledTooltip placement='top' id='view' target='edit'>
                                Edit
                            </UncontrolledTooltip> */}
                            <AddCountry Component={Button.Ripple} size="sm"  color={"primary"} edit={row}><Edit size={15} /></AddCountry>
                        </Show>

                        <Show IF={Permissions?.adminOperation}>

                            <ConfirmStop
                                item={row}
                                // eventId={`delete-${row?.id}`}
                                title={`Delete  ${row?.name} ?`}
                                color='text-warning'
                                onClickYes={() => deleteTheCountry(row?.id)}
                                // onSuccessEvent={(item) => { dispatch(userDelete(item?.id)); preload() }}
                                // onFailedEvent={((item) => { })}
                                onSuccessEvent={(item) => { preload() }}
                                onFailedEvent={((item) => { })}
                                className="waves-effect btn btn-danger btn-sm"
                                id={`grid-delete-${row?.id}`}>

                                <Trash size={15} />
                            </ConfirmStop>
                        </Show>
                    </ButtonGroup>
                )
            }
        }
    ]

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadCountry({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setTemplate,
            dispatch,
            loading: setLoading
        })
    }


    const CustomPagination = () => {
        const count = Math.ceil(list?.total / list?.per_page)
        return (
            <ReactPaginate
                initialPage={list?.current_page - 1}
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


    return (
        <>
            <Header icon={<LanguageIcon />} title="Country List">
                <ButtonGroup className='me-25'>
                    <AddCountry Component={Button.Ripple} size="sm" color={"primary"} preload={preload}>Add Country</AddCountry>
                    <Button.Ripple size="sm" color="dark" id="filteree" onClick={() => setShowFilter(true)}>
                        <Sliders size="14" on />
                    </Button.Ripple>
            <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>
            <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
            {/* <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => {
                        setFilterData({ }); setReload(true)
                    }} > */}
            <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                <RefreshCcw size="14" />
            </Button.Ripple>
        </ButtonGroup >
            </Header>

            <Card>
                <Row className='justify-content-end mx-0'>
                    <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>
                        <Form onSubmit={handleSubmit(submitFilter)}>

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
                                            loading={loading}
                                            className="btn btn-primary"
                                            color="primary"
                                            type="submit"
                                            size="sm"
                                        >
                                            <Search size={15} />
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
                                    columns={countryColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                               
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={list?.data}
                            />
                        </div>
                    </div>
                </>
                }
            </Card>
            <FilterCountry show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />

        </>
    )

}

export default CountryList
