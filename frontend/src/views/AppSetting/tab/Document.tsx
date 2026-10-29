// @ts-nocheck
import '@styles/react/libs/tables/react-dataTable-component.scss'
import React, { forwardRef, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Eye, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, CardHeader, CardTitle, Col, Form, Input, Row, Spinner } from 'reactstrap'
import { documentDelete } from '../../../redux/reducers/appSettingsRedux'
import { zeroOne } from '../../../utility/Const'
import Hide from '../../../utility/Hide'
import Show from '../../../utility/Show'
import { createConstSelectOptions } from '../../../utility/Utils'
import { deleteDocument, documentUpload, getUserDocument } from '../../../utility/apis/appSetting'
import ConfirmAlert from '../../../utility/helpers/ConfirmAlert'
import { isValid, isValidArray, log } from '../../../utility/helpers/common'
import httpConfig from '../../../utility/http/httpConfig'
import DropZone from '../../components/fileUploader'
import FormGroupCustom from '../../components/formGroupCustom'
import Shimmer from '../../components/shimmers/Shimmer'

const Document = ({ edit, activeTab }) => {

    const docList = useSelector(a => a.apps.appSetting)
    const user = useSelector(state => state.auth.userData)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, setError, getValues } = form
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
        per_page_record: 15
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
            },
            errors: (e) => {
                const d = e?.data?.data
                for (const key in d) {
                    if (Object.hasOwnProperty.call(d, key)) {
                        if (isValidArray(d[key])) {
                            const message = d[key]?.map(a => `${a} \n`)
                            setError(key, { message, type: "validate" })
                        }
                    }
                }

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

        {
            name: "#",
            cell: (row, index) => {
                return (filterData?.per_page_record * (page - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Title",
            selector: r => r.title,
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
                <Col md={user?.userType === 0 ? "12" : "8"}>

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
                <Hide IF={user?.userType === 0 || user?.userType === 3}>
                    <Col md="4">
                        <Card className='p-2'>
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Row>
                                    <Col md="12">
                                        <FormGroupCustom
                                            // noLabel
                                            key={resetIt}
                                            name={"title"}
                                            type={"text"}
                                            value={watch('title')}
                                            errors={errors}
                                            control={control}
                                            rules={{ required: true }}
                                            label={"Title"}
                                            className="mb-1"
                                        // values={edit?.file_path}

                                        />
                                    </Col>
                                    <Col md="12">
                                        <FormGroupCustom
                                            defaultOptions
                                            key={resetIt}
                                            // value={watch('is_share_to_parent')}

                                            type={"select"}
                                            control={control}
                                            errors={errors}
                                            name={"is_share_to_parent"}
                                            className='mb-1'
                                            label={"Share to Parent"}
                                            options={createConstSelectOptions(zeroOne)}
                                            rules={{ required: true }}

                                        />
                                    </Col>
                                    <Col md="12">

                                        <FormGroupCustom
                                            noLabel
                                            name={"file_path"}
                                            type={"hidden"}
                                            key={resetIt}
                                            // value={watch('file_path')}

                                            errors={errors}
                                            control={control}
                                            rules={{ required: false }}
                                            values={edit?.file_path}

                                        />
                                        <DropZone value={isValid(edit?.file_path) ? `${edit?.file_path}` : null} name={edit?.file_path} accept="image/png, image/gif, image/jpeg" key={resetIt} onSuccess={e => setValue("file_path", e[0]?.file_name)} />
                                    </Col>


                                    <Col md="4" className='mt-1'>
                                        <Button.Ripple type='submit' color="primary">
                                            {loading ? <Spinner size="sm" /> : 'Save'}
                                        </Button.Ripple>
                                    </Col>
                                </Row>
                            </Form>
                        </Card>
                    </Col>
                </Hide>
            </Row>

        </>
    )
}

export default Document
