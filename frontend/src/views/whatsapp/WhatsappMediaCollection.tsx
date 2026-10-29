// @ts-nocheck
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, CardBody, Input, UncontrolledTooltip } from 'reactstrap'
import { createAsyncSelectMultiUserOptions } from '../../utility/Utils'
import { loadUserChild } from '../../utility/apis/userManagement'
import { loadWhatsappMedia } from '../../utility/apis/whatsappMedia'
import { log } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import Header from '../components/header'
import CenteredModal from '../components/modal/CenteredModal'
import Shimmer from '../components/shimmers/Shimmer'
import AddWhatsappMedia from './AddWhatsappMedia'
import MediaFilter from './Filter/MediaFilter'


export default function WhatsappMediaCollection({ setMediaData = () => { }, setMediaFilePath = () => { }, setFileCaption = () => { }, getUserId, fileType,  edit = null, noView = false, modal = false, setModal = () => { }, Component = "span", children = null, ...rest }) {

    const media = useSelector(a => a.whatsappMedia.whatsappMedia)
    const [open, setOpen] = useState(false)
    const loginUser = useSelector(state => state.auth.userData)
    const [editData, setEditData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
    const mediaRef = useRef()
    const [showFilter, setShowFilter] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const dispatch = useDispatch()
    const [rowsSelected, setRowsSelected] = useState([])
    const [fileSelected, setFileSelected] = useState([])
    const [waMediaFile, setWaMediaFile] = useState([])
    const form = useForm()
    const [reload, setReload] = useState(false)
    const [resetIt, setResetIt] = useState(new Date())
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form


    const handleShow = () => {
        reset()
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
    }


    const listUser = async (search, loadedOptions, { page }) => {
        // if (user_id)
        const res = await loadUserChild({
            async: true,
            page,
            perPage: 25,
            // dispatch,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUser)

    }

    const preload = (data) => {
        loadWhatsappMedia({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setDlr(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                user_id: getUserId?.id,
                file_type: fileType
                
            }
        })
    }

    useEffect(() => {
        if (open) {
            preload()
        }
    }, [open])


    const BootstrapCheckbox = forwardRef((props, ref) => (
        <div className='form-check'>
            <Input type='checkbox' innerRef={ref} {...props} />
        </div>
    ))
    // Handle Rows selection
    const handleReportChange = ({ selectedRows }) => {
        const selectedR = selectedRows.map((item) => {
            return item?.file_path
        })
        const selectedF = selectedRows.map((item) => {
            return item?.file_caption
        })
        const selectedFilePath = selectedRows.map((item) => {
            return item?.wa_file_id
        })
        
        setFileSelected(selectedF)
        setRowsSelected(selectedR)
        setWaMediaFile(selectedFilePath)
    }

    const handleSave = (data) => {

    }

    
    useEffect(() => {
        setMediaData(rowsSelected)
        setFileCaption(fileSelected)
        setMediaFilePath(waMediaFile)
    }, [rowsSelected, fileSelected, waMediaFile])

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadWhatsappMedia({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setDlr,
            dispatch,
            loading: setLoading
        })
    }
    const mediaColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        // {
        //     name: "Username",
        //     selector: (row) => (row?.name),
        //     sortable: true,
        //     minWidth: '170px'
        // },
        {
            name: "File Caption",
            cell: (row, index) => {
                return (<span className='text-wrap' style={{ cursor: "pointer", color: "darkorange" }} >{row.file_caption ?? 'N/A'}</span>)
            },
            sortable: true,
            minWidth: '250px'
        },

        // {
        //     name: "File Type",
        //     selector: 'file_type',
        //     sortable: true,
        //     minWidth: '170px'
        // },
        {
            name: "File Path",
            selector: (row) => {
                return (<a href={`${httpConfig?.baseUrl2}/${row?.file_path}`} target='_blank' rel='noreferrer noopener'> View </a>)

            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "File Path",
            cell: (row) => {
                if (row?.file_type === "image") {
                    return (<img src={`${httpConfig?.baseUrl2}/${row?.file_path}`} style={{ width: "auto", height: "50px" }} />)
                } else if (row?.file_type === "video") {
                    return (<video src={`${httpConfig?.baseUrl2}/${row?.file_path}`} style={{ width: "auto", height: "50px" }} />)
                } else if (row?.file_type === "audio") {
                    return (<audio src={`${httpConfig?.baseUrl2}/${row?.file_path}`}  controls = {true} />)
                } else if (row?.file_type === "document") {
                    return (<img className='rounded me-50'
                        src={"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/391px-PDF_file_icon.svg.png"}
                        alt='image' style={{ width: "50px", height: "50px" }} />)
                }

            },
            sortable: true,
            minWidth: '170px'
        }
        // {
        //     name: "Mime Type",
        //     selector: 'mime_type',
        //     sortable: true,
        //     minWidth: '170px'
        // }

    ]

    const CustomPagination = () => {
        const count = Math.ceil(media?.total / media?.per_page)
        return (
            <ReactPaginate
                initialPage={media?.current_page - 1}
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
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                loading={loading}
                open={open}
                scrollControl={false}
                handleModal={handleClose}
                modalClass="modal-xl"
                handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                hideSave={true}
                title={'Browse Whatsapp Collection'}>
                <form>
                    
                    <CardBody>
                        <Header icon={""} title={"Whatsapp Media"}>
                            <ButtonGroup>

                                {/* <Show IF={Permissions?.whatsappConfigCreate}> */}

                                <AddWhatsappMedia Component={Button.Ripple} size="sm" color={"primary"} preload={preload}>Add Whatsapp File</AddWhatsappMedia>
                                {/* </Show> */}


                                <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                                {/* <UncontrolledTooltip target="filteree">Filter</UncontrolledTooltip>
                                <Button.Ripple size="sm" color="secondary" id="filteree" onClick={() => { setShowFilter(true) }}>
                                    <Sliders size="14" />
                                </Button.Ripple> */}
                                <Button.Ripple size="sm" color="dark" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset(); preload() }}>
                                    <RefreshCcw size="14" />
                                </Button.Ripple>
                            </ButtonGroup>
                        </Header>

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
                                        selectableRows
                                        pagination
                                        paginationServer
                                        className='react-dataTable'
                                        columns={mediaColumn}
                                        selectableRowsSingle={true}
                                        noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                            No Record Found
                                        </div>}
                                        selectableRowsComponent={BootstrapCheckbox}
                                        sortIcon={<ChevronDown size={10} />}
                                        paginationComponent={CustomPagination}
                                        data={media?.data}
                                        onSelectedRowsChange={handleReportChange}
                                    />
                                </div>
                            </div>
                        </>
                        }
                    </CardBody>
                </form>
                <MediaFilter show={showFilter} filterData={filterData} setFilterData={e => {
                    setCurrentPage(1)
                    setFilterData(e)
                }} handleFilterModal={() => { setShowFilter(false) }} />
            </CenteredModal>
        </>
    )

}
