import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, ButtonGroup, CardBody, Input, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledTooltip } from 'reactstrap'
import DataTable, { type TableColumn } from 'react-data-table-component'
import { ChevronDown, RefreshCcw } from 'react-feather'
import ReactPaginate from 'react-paginate'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { loadWhatsappMedia } from '../../../utility/apis/whatsappMedia'
import { isValidArray } from '../../../utility/helpers/common'
import httpConfig from '../../../utility/http/httpConfig'
import Header from '../../components/header'
import Shimmer from '../../components/shimmers/Shimmer'
import MediaFilter from '../../whatsapp/Filter/MediaFilter'
import AddWhatsappMedia from '../../whatsapp/AddWhatsappMedia'

type WhatsappMediaRow = {
    file_caption?: string
    file_path?: string
    file_type?: 'image' | 'video' | 'audio' | 'document' | string
}

type WhatsappMediaStore = {
    current_page?: number
    data?: WhatsappMediaRow[]
    per_page?: number
    total?: number
}

type FilterData = {
    file_type?: string
    per_page_record?: number
    user_id?: number | string | null
    [key: string]: unknown
}

type ListWhatsappProps = {
    fileType?: number
    getUserId?: number | string | null
    list: boolean
    open?: boolean
    handleList?: () => void
    setList: React.Dispatch<React.SetStateAction<boolean>>
    setMediaData?: (mediaPaths: string[]) => void
    toggleList?: () => void
}

type PageChangeEvent = {
    selected: number
}

type SelectedRowsEvent = {
    selectedRows: WhatsappMediaRow[]
}

const RippleButton = ((Button as unknown as { Ripple?: React.ComponentType<any> }).Ripple ?? Button) as React.ComponentType<any>

const ListWhatsapp = ({
    setList,
    list,
    getUserId,
    fileType,
    setMediaData = () => undefined
}: ListWhatsappProps) => {
    const [loading, setLoading] = useState(false)
    const { reset } = useForm()
    const media = useAppSelector(state => (state as any).whatsappMedia?.whatsappMedia as WhatsappMediaStore | undefined)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const rowsPerPage = 15
    const dispatch = useAppDispatch()
    const [showFilter, setShowFilter] = useState(false)
    const [rowsSelected, setRowsSelected] = useState<string[]>([])
    const [selectedCaptions, setSelectedCaptions] = useState<string[]>([])
    const [filterData, setFilterData] = useState<FilterData>({
        per_page_record: rowsPerPage
    })

    const checkFileType = useCallback((value?: number) => {
        if (value === 1) return 'image'
        if (value === 2) return 'video'
        if (value === 3) return 'document'
        return undefined
    }, [])

    const fetchMedia = useCallback(
        (pageToLoad: number) => {
            loadWhatsappMedia({
                page: pageToLoad,
                perPage: rowsPerPage,
                dispatch,
                loading: setLoading,
                jsonData: {
                    ...filterData,
                    user_id: getUserId,
                    file_type: checkFileType(fileType)
                }
            } as any)
        },
        [dispatch, rowsPerPage, filterData, getUserId, fileType, checkFileType]
    )

    const preload = useCallback(() => {
        fetchMedia(currentPage)
    }, [fetchMedia, currentPage])

    const BootstrapCheckbox = forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>((props, ref) => (
        <div className='form-check'>
            <Input type='checkbox' innerRef={ref} {...props} />
        </div>
    ))
    BootstrapCheckbox.displayName = 'BootstrapCheckbox'

    const handleReportChange = ({ selectedRows }: SelectedRowsEvent) => {
        const selectedPaths = selectedRows
            .map(item => item?.file_path)
            .filter((filePath): filePath is string => Boolean(filePath))

        const selectedFileCaptions = selectedRows
            .map(item => item?.file_caption)
            .filter((caption): caption is string => Boolean(caption))

        setSelectedCaptions(selectedFileCaptions)
        setRowsSelected(selectedPaths)
    }

    useEffect(() => {
        setMediaData(rowsSelected)
    }, [rowsSelected, selectedCaptions, setMediaData])

    const handlePagination = (page: PageChangeEvent) => {
        const selectedPage = page.selected + 1
        setCurrentPage(selectedPage)
        fetchMedia(selectedPage)
    }

    const mediaColumn: TableColumn<WhatsappMediaRow>[] = useMemo(
        () => [
            {
                name: '#',
                cell: (_row, index) => (rowsPerPage * (currentPage - 1)) + (index + 1),
                maxWidth: '10px'
            },
            {
                name: 'File Caption',
                cell: row => <span className='text-wrap' style={{ color: 'darkorange', cursor: 'pointer' }}>{row.file_caption ?? 'N/A'}</span>,
                sortable: true,
                minWidth: '250px'
            },
            {
                name: 'File Path',
                cell: row => {
                    if (!row?.file_path) {
                        return 'N/A'
                    }

                    return (
                        <a href={`${httpConfig?.baseUrl2}/${row.file_path}`} target='_blank' rel='noreferrer noopener'>
                            View
                        </a>
                    )
                },
                sortable: true,
                minWidth: '170px'
            },
            {
                name: 'Preview',
                cell: row => {
                    if (!row?.file_path) return null
                    const source = `${httpConfig?.baseUrl2}/${row.file_path}`

                    if (row.file_type === 'image') {
                        return <img src={source} alt='media preview' style={{ width: 'auto', height: '50px' }} />
                    }

                    if (row.file_type === 'video') {
                        return <video src={source} style={{ width: 'auto', height: '50px' }} />
                    }

                    if (row.file_type === 'audio') {
                        return <audio src={source} controls />
                    }

                    if (row.file_type === 'document') {
                        return (
                            <img
                                className='rounded me-50'
                                src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/391px-PDF_file_icon.svg.png'
                                alt='document preview'
                                style={{ width: '50px', height: '50px' }}
                            />
                        )
                    }

                    return null
                },
                sortable: true,
                minWidth: '170px'
            }
        ],
        [currentPage, rowsPerPage]
    )

    const CustomPagination = () => {
        const totalPages = Math.ceil((media?.total ?? 0) / (media?.per_page ?? rowsPerPage))
        return (
            <ReactPaginate
                initialPage={Math.max((media?.current_page ?? 1) - 1, 0)}
                disableInitialCallback
                previousLabel=''
                nextLabel=''
                breakLabel='...'
                pageCount={totalPages}
                activeClassName='active'
                onPageChange={handlePagination}
                pageClassName='page-item'
                nextLinkClassName='page-link'
                nextClassName='page-item next'
                previousClassName='page-item prev'
                previousLinkClassName='page-link'
                pageLinkClassName='page-link'
                breakClassName='page-item'
                breakLinkClassName='page-link'
                containerClassName='pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
            />
        )
    }

    useEffect(() => {
        if (list) {
            preload()
            reset()
        }
    }, [list, preload, reset])

    return (
        <div className='demo-inline-spacing'>
            <div className='basic-modal'>
                <Modal isOpen={list} toggle={() => setList(!list)} className='modal-xl'>
                    <ModalHeader toggle={() => setList(!list)}>Whatsapp Media Collection</ModalHeader>
                    <ModalBody>
                        <CardBody>
                            <Header icon='' title='Whatsapp Media' subHeading=''>
                                <ButtonGroup>
                                    <AddWhatsappMedia Component={RippleButton as any} size='sm' color='primary' preload={preload}>
                                        Add Whatsapp File
                                    </AddWhatsappMedia>
                                    <UncontrolledTooltip target='reload'>Refresh Data</UncontrolledTooltip>
                                    <RippleButton
                                        size='sm'
                                        color='dark'
                                        id='reload'
                                        onClick={() => {
                                            setFilterData({})
                                            setCurrentPage(1)
                                            reset()
                                            fetchMedia(1)
                                        }}
                                    >
                                        <RefreshCcw size={14} />
                                    </RippleButton>
                                </ButtonGroup>
                            </Header>

                            {loading ? (
                                <>
                                    <Shimmer style={{ width: '100%', height: 50, marginBottom: 5, marginTop: 5 }} />
                                    <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
                                    <Shimmer style={{ width: '100%', height: 50, marginBottom: 5 }} />
                                </>
                            ) : (
                                <div className='card-datatable app-user-list table-responsive'>
                                    <div className='react-dataTable'>
                                        <DataTable
                                            noHeader
                                            selectableRows
                                            pagination
                                            paginationServer
                                            className='react-dataTable'
                                            columns={mediaColumn}
                                            selectableRowsSingle
                                            noDataComponent={
                                                <div className='nodata-class' style={{ padding: '2rem' }}>
                                                    No Record Found
                                                </div>
                                            }
                                            selectableRowsComponent={BootstrapCheckbox as any}
                                            sortIcon={<ChevronDown size={10} />}
                                            paginationComponent={CustomPagination}
                                            data={media?.data ?? []}
                                            onSelectedRowsChange={handleReportChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardBody>

                        <MediaFilter
                            show={showFilter}
                            filterData={filterData as any}
                            setFilterData={(data: FilterData) => {
                                setCurrentPage(1)
                                setFilterData(data)
                            }}
                            handleFilterModal={() => {
                                setShowFilter(false)
                            }}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color='primary' onClick={() => setList(!list)}>
                            {isValidArray(rowsSelected) ? 'Select' : 'Close'}
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        </div>
    )
}

export default ListWhatsapp
