// @ts-nocheck
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Eye, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, CardHeader, CardTitle, Col, Form, Input, Row, Spinner } from 'reactstrap'
import { documentDelete } from '../../../redux/reducers/appSettingsRedux'
import { deleteDocument, documentUpload, getUserDocument } from '../../../utility/apis/appSetting'
import { zeroOne } from '../../../utility/Const'
import { isValid, log } from '../../../utility/helpers/common'
import ConfirmAlert from '../../../utility/helpers/ConfirmAlert'
import Hide from '../../../utility/Hide'
import httpConfig from '../../../utility/http/httpConfig'
import Show from '../../../utility/Show'
import { createConstSelectOptions } from '../../../utility/Utils'
import DropZone from '../../components/fileUploader'
import FormGroupCustom from '../../components/formGroupCustom'
import Shimmer from '../../components/shimmers/Shimmer'

const UserDocs = ({ edit, activeTab }) => {
    const form = useForm()
    const docList = useSelector(a => a.apps.appSetting)
    const user = useSelector(state => state.auth.userData)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues } = form
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage, setRowsPerPage] = useState("15")
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())

    const [document, setDocument] = useState(null)
    const [page, setPage] = useState(1)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        user_id: edit?.id
    })

    const listDocument = () => {
        getUserDocument({
            page,
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
        if (activeTab === "6") {
            listDocument()
        }
    }, [filterData, activeTab])

    const onSubmit = (data) => {
        documentUpload({
            jsonData: {
                ...data

                // is_share_to_parent : data?.is_share_to_parent === 1 ? 1 : 0
            },
            dispatch,
            loading: setLoading,
            success: (d) => {
                // reset()
                setResetIt(new Date()); reset()
                // setValue("file_path")
                // setValue("is_share_to_parent")
                setValue("title", null)
                // log(d)
            }
        })
        // log(data)
    }

    //open image
    const openImage = (row) => {
        window.open(httpConfig?.baseUrl2 + row?.document, "_blank")
    }

    const handlePagination = page => {
        setPage(page?.selected + 1)
        getUserDocument({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setTemplate,
            dispatch,
            loading: setLoading
        })
    }


    const handleReload = () => {
        listDocument()
    }

    const userDocs = [
        // {
        //     name: "#",
        //     selector: (row, i) => (row.id ? (i + 1) : null),
        //     maxWidth: "10px"

        // },
        {
            name: "#",
            cell: (row, index) => {
                return (filterData?.per_page_record * (page - 1)) + (index + 1)
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
            name: "Share To Parent",
            selector: (row) => (row?.is_share_to_parent === 1 ? 'Yes' : 'No'),
            sortable: true,
            minWidth: '170px'
        },
        {
            name: "Uploaded By",
            selector: (row) => {
                return (
                    <><Show IF={user?.userType === 0 || user?.userType === 3}> {row?.user?.name} </Show></>
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

                        <Button.Ripple size="sm" color="primary" onClick={() => openImage(row)} >
                            <Eye size="14" />
                        </Button.Ripple>
                        <ConfirmAlert
                            title={`Delete ${row?.title} ?`}
                            color='text-warning'
                            onClickYes={() => deleteDocument({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                            // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                            onSuccess={deleted}
                            onFailed={failed}
                            onClose={(e) => {
                                if (e) {
                                    dispatch(documentDelete(deletedId))
                                }
                                setDeleted(null)
                                setFailed(null)
                            }}
                            className="waves-effect btn btn-danger btn-sm"
                            id={`grid-delete-${row?.id}`}>
                            <Trash2 size={15} />
                        </ConfirmAlert>
                    </ButtonGroup>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(docList?.total / docList?.per_page)
        return (
            <ReactPaginate
                initialPage={docList?.current_page - 1}
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
            <Row>
                <Col md={"12"}>

                    <Card className='p-2'>
                        <CardHeader className='border-bottom inline'>
                            <CardTitle className='text-primary' tag='h4'>Document List</CardTitle>
                        </CardHeader>
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
                                        columns={userDocs}
                                        noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                            No Record Found
                                        </div>}
                                        selectableRowsComponent={BootstrapCheckbox}
                                        sortIcon={<ChevronDown size={10} />}
                                        paginationComponent={CustomPagination}
                                        data={docList?.data}
                                    // onSelectedRowsChange={handleReportChange}
                                    />
                                </div>
                            </div>
                        </>
                        }


                    </Card>

                </Col>

            </Row>

        </>
    )
}

export default UserDocs
