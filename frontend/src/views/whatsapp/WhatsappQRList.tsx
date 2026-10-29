// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { useEffect, useState } from 'react'
import CopyToClipboard from '@components/copy-to-clipboard'
import DataTable from 'react-data-table-component'
import { ChevronDown, Copy, RefreshCcw, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, Modal, ModalBody, ModalHeader, UncontrolledTooltip } from 'reactstrap'
import { deleteWhatsQr, loadWhatsappQr } from '../../utility/apis/waQrApi'
import ConfirmStop from '../../utility/helpers/ConfirmStop'
import { Permissions } from '../../utility/Permissions'
import Show from '../../utility/Show'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import AddQrCode from './AddQrCode'

const WhatsappQRList = () => {
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const qr = useSelector(a => a.whatsappQr.whatsappQr)
    const [showFilter, setShowFilter] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedQrImage, setSelectedQrImage] = useState(null)

    const toggleModal = () => setModalOpen(!modalOpen)
    const [reload, setReload] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
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
    const dispatch = useDispatch()
    const [resetIt, setResetIt] = useState(new Date())

    const preload = (data) => {
        loadWhatsappQr({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {

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

    const removeQr = (row) => {
        deleteWhatsQr({
            id: row,
            // dispatch,

            success: (e) => {
                //    preload()
            }
        })
    }


    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadWhatsappQr({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setDlr,
            dispatch,
            loading: setLoading
        })
    }


    const QRColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Username",
            selector: (row) => (row?.name),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Prefilled Message",
            cell: (row, index) => {
                return (<span className='text-wrap' >{row.prefilled_message ?? 'N/A'}</span>)
            },
            sortable: true,
            minWidth: '250px'
        },

        {
            name: "Image Format",
            selector: row => row?.qr_image_format,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Code",
            selector: row => row?.code,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Deep Link",

            selector: (row) => {
                // return (<img src={`${row?.deep_link_url}`} style={{ width: "auto", height: "50px" }} />)
                return (
                    <>
                       Copy Link <CopyToClipboard text={`${row?.deep_link_url}`} onCopy={() => toast('Link Copied!')}><Copy size={15} style={{ cursor: 'pointer', color: 'InfoText' }} /></CopyToClipboard>

                    </>)

            },
            sortable: true,
            minWidth: '170px'
        },
        // {
        //     name: "QR Image",
        //     selector: (row) => {
        //         return (<img src={`${row?.qr_image_url}`} style={{ width: "auto", height: "50px" }} />)

        //     },
        //     sortable: true,
        //     minWidth: '170px'
        // },
        {
            name: "QR Image",
            selector: (row) => {
                return (
                    <img
                        src={`${row?.qr_image_url}`}
                        style={{ width: "auto", height: "50px", cursor: "pointer" }}
                        onClick={() => {
                            setSelectedQrImage(row?.qr_image_url)
                            toggleModal()
                        }}
                        alt="QR Code"
                    />
                )
            },
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (
                    <ButtonGroup>
                        <Show IF={Permissions?.whatsappDeleteQRReport}>
                            <ConfirmStop
                                item={row}
                                // eventId={`stop-campaign-${row?.id}`}
                                title={`Delete  ${row?.prefilled_message} ?`}
                                color='text-warning'
                                onClickYes={() => removeQr(row?.id)}
                                text={'no-text'}
                                onSuccessEvent={(item) => { preload() }}
                                onFailedEvent={((item) => { })}
                                className="waves-effect btn btn-danger btn-sm"
                                style={{ cursor: 'pointer' }}
                                id={`grid-delete-${row?.id}`}>
                                <Trash2 size={15} />
                            </ConfirmStop>
                        </Show>
                    </ButtonGroup>
                )
            }
        }
    ]


    const CustomPagination = () => {
        const count = Math.ceil(qr?.total / qr?.per_page)
        return (
            <ReactPaginate
                initialPPage={qr?.current_page - 1}
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
            <Modal isOpen={modalOpen} toggle={toggleModal} centered>
                <ModalHeader toggle={toggleModal}>QR Code</ModalHeader>
                <ModalBody>
                    {selectedQrImage && (
                        <img
                            src={selectedQrImage}
                            alt="QR Code"
                            style={{ width: "100%", height: "auto" }}
                        />
                    )}
                </ModalBody>
            </Modal>

            <Header icon={""} title={"QR List"}>
                <ButtonGroup>

                    <Show IF={Permissions?.whatsappCreateQRReport}>

                        <AddQrCode Component={Button.Ripple} size="sm" color={"primary"} preload={preload}>Add QR</AddQrCode>
                    </Show>

                    <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>

                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true) }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>
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

                                pagination
                                paginationServer
                                className='react-dataTable'
                                columns={QRColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={qr?.data}
                            />
                        </div>
                    </div>
                </>
                }

            </Card>


        </>
    )
}

export default WhatsappQRList
