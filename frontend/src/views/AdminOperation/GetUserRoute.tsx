// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Badge, Card, Input } from 'reactstrap'
import { getUserRoute } from '../../utility/apis/adminOperation'
import { loadDlt } from '../../utility/apis/dlt'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import Router from '@mui/icons-material/Router'

const GetUserRoute = () => {

    const routeList = useSelector(a => a.adminOps.adminOperation)
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const { register, errors, handleSubmit } = useForm()

    const [importModal, setImportModal] = useState(false)
    const [userModal, setUserModal] = useState(false)
    const [rowsSelected, setRowsSelected] = useState([])
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })

    const dispatch = useDispatch()


    const handleImport = () => setImportModal(!importModal)
    const handleModal = () => setUserModal(!userModal)


    const preload = (data) => {
        getUserRoute({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setTemplate(e)
            },
            loading: setLoading,
            jsonData: filterData
        })
    }


    useEffect(() => {
        preload()
    }, [filterData])


    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        getUserRoute({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setTemplate,
            dispatch,
            loading: setLoading
        })
    }

    // Handle Rows selection
    const handleReportChange = ({ selectedRows }) => {

        const selectedR = selectedRows.map((item, index) => {
            return item.id
        })
        setRowsSelected(selectedR)

    }


    const handleReload = () => {
        preload()
    }

    const activityColumn = [
        // {
        //     name: "#",
        //     selector: (row, i) => (row.id ? (i + 1) : null),
        //     maxWidth: "10px"

        // },
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Name",
            selector: r => r.name,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Promotional(SMPP)",
            selector: (row) => (row?.promotional_route_info?.primary_route?.route_name),
            sortable: true,
            minWidth: '215px'
        },
        {
            name: "Promotional(Secondary)",
            selector: (row) => (row?.promotional_route_info?.sec_route_name),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Transaction(SMPP)",
            selector: (row) => (row?.transaction_route_info?.primary_route?.route_name),
            sortable: true,
            minWidth: '215px'
        },
        {
            name: "Transaction(SMPP)",
            selector: (row) => (row?.transaction_route_info?.sec_route_name),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Two-Way(SMPP)",
            selector: (row) => (row?.two_waysms_route_info?.primary_route?.route_name),
            sortable: true,
            minWidth: '215px'
        },
        {
            name: "Two-Way(Secondary)",
            selector: (row) => (row?.two_waysms_route_info?.sec_route_name),
            sortable: true,
            minWidth: '260px'
        },
        {
            name: "Voice(SMPP)",
            selector: (row) => (row?.voice_sms_route_info?.primary_route?.route_name),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Voice(Secondary)",
            selector: (row) => (row?.voice_sms_route_info?.sec_route_name),
            sortable: true,
            minWidth: '215px'
        }

    ]

    const CustomPagination = () => {
        const count = Math.ceil(routeList?.total / routeList?.per_page)
        return (
            <ReactPaginate
                initialPage={routeList?.current_page - 1}
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

            <Header icon={<Router />} title={"User Routes"} />

            <Card>

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
                                columns={activityColumn}
                                noDataComponent={<div className="nodata-class">
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={routeList?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>


        </>
    )
}


export default GetUserRoute
