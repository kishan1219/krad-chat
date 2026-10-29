// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Plus, RefreshCcw, Search, Sliders, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, Col, Form, Row, UncontrolledTooltip } from 'reactstrap'
import Shimmer from '../components/shimmers/Shimmer'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import WhatsApp from '@mui/icons-material/WhatsApp'
import { adminWhatsappRateCard } from '../../utility/apis/whatsappRateCard'
import LanguageIcon from '@mui/icons-material/Language'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'

const whatsappRateCard = () => {
    const [loading, setLoading] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [rateCard, setRateCard] = useState(null)
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
        adminWhatsappRateCard({
            page: currentPage,
            perPage: rowsPerPage,
          
            success: (e) => {
                setRateCard(e)
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
        
        })
    }

    const rateColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Country",

            selector: r => (<>{r?.country_name} <span className='fw-bolder'>({r?.currency})</span></>),
            sortable: true,
            minWidth: '180px'
        },
        {
            name: "Authentication Charge",
            selector: r => r?.authentication_charge,
            sortable: true,
            minWidth: '150px'
        },
        {
            name: "International Charge",
            selector: r => (r?.authentication_international_charge ?? 'N/A'),
            sortable: true,
            minWidth: '150px'
        },
        {
            name: "Marketing Charge",
            selector: r => r?.marketing_charge,
            sortable: true,
            minWidth: '180px'
        },
        
        {
            name: "Service Charge",
            selector: r => r?.service_charge,
            sortable: true,
            minWidth: '140px'
        },
        {
            name: "Utility Charge",
            selector: r => r?.utility_charge,
            sortable: true,
            minWidth: '140px'
        }
    ]

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        adminWhatsappRateCard({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            success: setRateCard,
            loading: setLoading
        })
    }

    const CustomPagination = () => {
        const count = Math.ceil(rateCard?.data?.total / rateCard?.data?.per_page)
        return (
            <ReactPaginate
                initialPage={rateCard?.data?.current_page - 1}
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
            <Header icon={<CurrencyRupeeIcon />} title="Whatsapp Rate Card">
                <ButtonGroup className='me-25'>
                    
                    <UncontrolledTooltip target="reload">refresh data</UncontrolledTooltip>

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
                                pagination
                                paginationServer
                                className='react-dataTable'
                                columns={rateColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}

                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={rateCard?.data?.data}
                            />
                        </div>
                    </div>
                </>
                }
            </Card>

        </>
    )

}

export default whatsappRateCard
