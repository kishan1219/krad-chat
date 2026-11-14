// @ts-nocheck
import React from 'react'
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import { ChevronDown } from 'react-feather'
import { Report } from '@mui/icons-material'
import VerifiedIcon from '@mui/icons-material/Verified'
import BsTooltip from '../../../components/tooltip'
import Shimmer from '../../../components/shimmers/Shimmer'
import { ConfigRowActions } from './ConfigRowActions'
import { ConfigMobileCard } from './ConfigMobileCard'

interface ConfigDataTableProps {
    loading: boolean
    config: any
    currentPage: string | number
    rowsPerPage: string | number
    onPageChange: (page: { selected: number }) => void
    colors: any
    onQualityCheck: (row: any) => void
    onOpenVerificationModal: (row: any) => void
    onRegisterPhone: (row: any) => void
    onSubscribeApps: (row: any) => void
    onOpenEcommerce: (row: any) => void
    onOpenCalling: (row: any) => void
    onDelete: (row: any) => void
    preload: () => void
    deletedState: any
    failedState: any
    onCloseConfirmAlert: (confirmed: boolean, row: any) => void
    onSelectedRowsChange: (state: any) => void
}

export function ConfigDataTable({
    loading,
    config,
    currentPage,
    rowsPerPage,
    onPageChange,
    colors,
    onQualityCheck,
    onOpenVerificationModal,
    onRegisterPhone,
    onSubscribeApps,
    onOpenEcommerce,
    onOpenCalling,
    onDelete,
    preload,
    deletedState,
    failedState,
    onCloseConfirmAlert,
    onSelectedRowsChange
}: ConfigDataTableProps) {
    if (loading) {
        return (
            <div className="p-3">
                {[...Array(6)].map((_, i) => (
                    <Shimmer key={i} style={{ width: '100%', height: 50, marginBottom: 8 }} />
                ))}
            </div>
        )
    }

    const showStatus = (row: any) => {
        if (row?.code_verification_status === 'VERIFIED') {
            return (
                <BsTooltip title="VERIFIED" placement="top" className="text-success" style={{ cursor: 'pointer' }}>
                    <VerifiedIcon style={{ color: 'success' }} />
                </BsTooltip>
            )
        }
        return (
            <BsTooltip title="NOT VERIFIED" placement="top" className="text-danger" style={{ cursor: 'pointer' }}>
                <Report style={{ color: 'warning' }} />
            </BsTooltip>
        )
    }

    const verificationColor = (row: any) => {
        const status = row?.quality_rating === 'UNKNOWN' || !row?.quality_rating ? 'black' : row?.quality_rating.toLowerCase()
        return <span style={{ height: 10, width: 50, backgroundColor: status, display: 'inline-block', borderRadius: 8 }} />
    }

    const columns = [
        {
            name: '#',
            cell: (_: any, index: number) => Number(rowsPerPage) * (Number(currentPage) - 1) + (index + 1),
            maxWidth: '50px'
        },
        {
            name: 'Username',
            selector: (row: any) => row?.name,
            sortable: true,
            minWidth: '150px'
        },
        {
            name: 'Verified Name',
            cell: (row: any) => (
                <div className="d-flex align-items-center gap-1 flex-wrap">
                    {showStatus(row)}
                    <span>{row?.verified_name || 'Pending Review'}</span>
                    {row?.name_status === 'APPROVED' ? (
                        <span className="badge bg-light-success text-success" style={{ fontSize: '0.65rem' }}>✓ Approved</span>
                    ) : row?.name_status === 'PENDING_REVIEW' ? (
                        <span className="badge bg-light-warning text-warning" style={{ fontSize: '0.65rem' }}>Review Pending</span>
                    ) : row?.name_status === 'DECLINED' || row?.name_status === 'REJECTED' ? (
                        <span className="badge bg-light-danger text-danger" style={{ fontSize: '0.65rem' }}>Rejected</span>
                    ) : null}
                </div>
            ),
            sortable: true,
            minWidth: '160px'
        },
        {
            name: 'Sender Number',
            selector: (row: any) => row?.display_phone_number_req || row?.sender_number || 'N/A',
            sortable: true,
            minWidth: '150px'
        },
        {
            name: 'Business Account Id',
            selector: (row: any) => row?.business_account_id,
            sortable: true,
            minWidth: '170px'
        },
        {
            name: 'Quality',
            cell: (row: any) => (
                <BsTooltip title={row?.quality_rating || 'UNKNOWN'} placement="top" className="text-danger" style={{ cursor: 'pointer' }}>
                    {verificationColor(row)}
                </BsTooltip>
            ),
            sortable: true,
            maxWidth: '100px'
        },
        {
            name: 'Actions',
            allowOverflow: true,
            minWidth: '220px',
            cell: (row: any) => (
                <ConfigRowActions
                    row={row}
                    colors={colors}
                    onQualityCheck={onQualityCheck}
                    onOpenVerificationModal={onOpenVerificationModal}
                    onRegisterPhone={onRegisterPhone}
                    onSubscribeApps={onSubscribeApps}
                    onOpenEcommerce={onOpenEcommerce}
                    onOpenCalling={onOpenCalling}
                    onDelete={onDelete}
                    preload={preload}
                    deletedState={deletedState}
                    failedState={failedState}
                    onCloseConfirmAlert={onCloseConfirmAlert}
                />
            )
        }
    ]

    const totalPages = Math.ceil((config?.total || 0) / (config?.per_page || Number(rowsPerPage)))

    const CustomPagination = () => (
        <ReactPaginate
            initialPage={Math.max(0, (config?.current_page || Number(currentPage)) - 1)}
            disableInitialCallback
            previousLabel=""
            nextLabel=""
            breakLabel="..."
            pageCount={totalPages || 1}
            activeClassName="active"
            onPageChange={onPageChange}
            pageClassName="page-item"
            nextLinkClassName="page-link"
            nextClassName="page-item next"
            previousClassName="page-item prev"
            previousLinkClassName="page-link"
            pageLinkClassName="page-link"
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
        />
    )

    const data = config?.data || []

    return (
        <div>
            {/* Desktop View: Full Responsive DataTable */}
            <div className="d-none d-md-block card-datatable app-user-list table-responsive">
                <DataTable
                    noHeader
                    pagination
                    paginationServer
                    className="react-dataTable"
                    columns={columns}
                    noDataComponent={<div className="nodata-class p-4 text-center text-muted">No Record Found</div>}
                    sortIcon={<ChevronDown size={10} />}
                    paginationComponent={CustomPagination}
                    data={data}
                    onSelectedRowsChange={onSelectedRowsChange}
                />
            </div>

            {/* Mobile View: High-Touch Mobile Cards */}
            <div className="d-block d-md-none p-2">
                {data.length === 0 ? (
                    <div className="text-center p-4 text-muted border rounded-3 bg-light">
                        No Record Found
                    </div>
                ) : (
                    data.map((row: any, idx: number) => (
                        <ConfigMobileCard
                            key={row?.id || idx}
                            row={row}
                            index={Number(rowsPerPage) * (Number(currentPage) - 1) + idx}
                            colors={colors}
                            onQualityCheck={onQualityCheck}
                            onOpenVerificationModal={onOpenVerificationModal}
                            onRegisterPhone={onRegisterPhone}
                            onSubscribeApps={onSubscribeApps}
                            onOpenEcommerce={onOpenEcommerce}
                            onOpenCalling={onOpenCalling}
                            onDelete={onDelete}
                            preload={preload}
                            deletedState={deletedState}
                            failedState={failedState}
                            onCloseConfirmAlert={onCloseConfirmAlert}
                        />
                    ))
                )}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                        <CustomPagination />
                    </div>
                )}
            </div>
        </div>
    )
}

