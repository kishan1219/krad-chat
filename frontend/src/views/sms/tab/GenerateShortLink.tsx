// @ts-nocheck
import React, { forwardRef, useContext, useEffect, useState } from 'react'
import { ArrowLeft, ChevronDown, Eye, MoreVertical, Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardHeader, Col, Form, Input, Row } from 'reactstrap'
import { isValid, isValidArray, log } from '../../../utility/helpers/common'
import LoadingButton from '../../components/buttons/LoadingButton'
import FormGroupCustom from '../../components/formGroupCustom'
import Header from '../../components/header'
import BsTooltip from '../../components/tooltip'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import { addTwoWaySMS, deleteTwoWay, loadTwoSms } from '../../../utility/apis/TwoWaySMS'
import DropDownMenu from '../../components/dropdown'
import { IconSizes } from '../../../utility/Const'
import { Permissions } from '../../../utility/Permissions'
import { twoWayDelete } from '../../../redux/reducers/TwoWay'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import Shimmer from '../../components/shimmers/Shimmer'
import useUser from '../../../utility/hooks/useUser'
import ConfirmAlert from '../../../utility/helpers/ConfirmAlert'
import { DeleteForever } from '@mui/icons-material'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import { loadUser } from '../../../utility/apis/userManagement'
import { createAsyncSelectMultiUserOptions } from '../../../utility/Utils'
import Show from '../../../utility/Show'

const GenerateShortLink = () => {
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form
    const navigate = useNavigate()
    const { colors } = useContext(ThemeColors)
    const loginUser = useSelector(state => state.auth.userData)

    const [reload, setReload] = useState(false)
    const twoWay = useSelector(a => a?.twoWay?.twoWay)
    const [loading, setLoading] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [showFilter, setShowFilter] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [rowsPerPage] = useState("15")
    const user = useUser()
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsSelected, setRowsSelected] = useState([])
    const [importModal, setImportModal] = useState(false)
    const [modal, setModal] = useState(false)
    const [editData, setEditData] = useState(null)
    const [resetIt, setResetIt] = useState(new Date())
    const [detailModal, setDetailModal] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15,
        is_web_temp: 2
    })
    const [userList, setUserList] = useState(null)

    const dispatch = useDispatch()

    const preload = (data) => {
        loadTwoSms({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setDlr(e)
            },
            loading: setLoading,

            jsonData: filterData
        })
    }

    useEffect(() => {
        preload()
    }, [filterData])

    const isfDisabled = () => {
        let re = true
        if (isValid(watch("title")) && isValid(watch("redirect_url")) && isValid(watch("content_expired"))) {
            re = false
        }


        return re
    }

    const listUser = async (search, loadedOptions, { page }) => {

        const res = await loadUser({
            async: true,
            page,
            perPage: 10,
            jsonData: { search }
        })
        return createAsyncSelectMultiUserOptions(res, page, "xName", "id", setUserList)

    }

    const onSubmit = (data) => {
        addTwoWaySMS({
            jsonData: {
                ...data,
                is_web_temp: 2,
                created_by: user?.id
            },
            loading: setLoading,
            success: (e) => {
                preload()
                setResetIt(new Date())
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
    }

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadTwoSms({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setDlr,
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

    const twoWayColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Title",
            selector: (row) => (row?.title),
            sortable: true,
            minWidth: '150px'
        },
        {
            name: "URL",
            selector: (row) => (row?.redirect_url ?? 'N/A'),
            sortable: true,
            minWidth: '170px'
        },

        {
            name: "Expired AT",
            selector: (row) => (row?.content_expired ?? 'N/A'),
            sortable: true,
            minWidth: '150px'
        },

        {
            name: "Created By",
            selector: 'created_by_name',
            sortable: true,
            minWidth: '150px'
        },

        {
            name: "actions",
            allowOverflow: true,
            minWidth: '150px',
            cell: row => {
                return (
                    <div>
                        <DropDownMenu
                            direction={'down'}
                            component={<MoreVertical color={colors.primary.main} size={IconSizes.MenuVertical} />}
                            options={[

                                {
                                    IF: Permissions.twoWay,
                                    noWrap: true,
                                    name: (
                                        <ConfirmAlert
                                            title={`Delete ${row?.title} ?`}
                                            color='text-warning'
                                            onClickYes={() => deleteTwoWay({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                                            // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                                            onSuccess={deleted}
                                            onFailed={failed}

                                            onClose={(e) => {
                                                if (e) {
                                                    dispatch(twoWayDelete(deletedId))
                                                }
                                                setDeleted(null)
                                                setFailed(null)
                                            }}
                                            className="dropdown-item"
                                            id={`grid-delete-${row?.id}`}>

                                            <DeleteForever size={14} /> <span className='ms-1 align-middle'>Delete</span>
                                        </ConfirmAlert>
                                    )
                                }

                            ]}
                        />
                    </div>
                )
            }
        }
    ]

    const CustomPagination = () => {
        const count = Math.ceil(twoWay?.total / twoWay?.per_page)
        return (
            <ReactPaginate
                initialPage={twoWay?.current_page - 1}
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
                <Col md="4" lg="4">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Card>
                            <CardHeader className='border-bottom'>
                                <h3> Generate Short Link</h3>
                            </CardHeader>
                            <Row className='p-2'>
                                <Show IF={loginUser?.userType === 0 || loginUser?.userType === 3}>
                                    <Col md="12">
                                        <FormGroupCustom

                                            // defaultOptions
                                            async
                                            control={control}
                                            type={"select"}
                                            errors={errors}
                                            name={"user_id"}
                                            isClearable
                                            placeholder="Select User"
                                            className='mb-1'
                                            key={resetIt}
                                            loadOptions={listUser}
                                            options={userList}
                                            label="User"
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                </Show>
                                <Col md="12">
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="title"
                                        key={resetIt}
                                        className='mb-1'
                                        label="Title"
                                        errors={errors}
                                        rules={{ required: true }}
                                    />
                                </Col>
                                <Col md="12">
                                    <FormGroupCustom
                                        type={"text"}
                                        control={control}
                                        name="redirect_url"
                                        key={resetIt}
                                        className='mb-1'
                                        label="Url"
                                        errors={errors}
                                        rules={{ required: true }}
                                    />
                                </Col>
                                <Col md="12">
                                    <FormGroupCustom
                                        type={"date"}
                                        control={control}
                                        name="content_expired"
                                        key={resetIt}
                                        options={{

                                            minDate: Date.now()
                                        }}
                                        className='mb-1'
                                        label="Linked Expired"
                                        errors={errors}
                                        rules={{ required: true }}

                                    />
                                </Col>
                                <div className='d-flex justify-content-center'>
                                    <LoadingButton type='submit' loading={loading} color='primary' className="mt-1" disabled={isfDisabled()}>
                                        Save
                                    </LoadingButton>
                                </div>
                            </Row>
                        </Card>
                    </Form>
                </Col>
                <Col md="8" lg="8">
                    <Card>
                        <CardHeader>
                            <h3>Short Links</h3>
                            <div className='d-flex justify-content-end'>
                                <BsTooltip title={'Go Back'}>
                                    <Button.Ripple size="sm" color="primary" outline onClick={() => { navigate(-1) }}>
                                        <ArrowLeft size={18} />
                                    </Button.Ripple>
                                </BsTooltip></div>
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
                                        columns={twoWayColumn}
                                        noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                            No Record Found
                                        </div>}
                                        selectableRowsComponent={BootstrapCheckbox}
                                        sortIcon={<ChevronDown size={10} />}
                                        paginationComponent={CustomPagination}
                                        data={twoWay?.data}
                                        onSelectedRowsChange={handleReportChange}
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


export default GenerateShortLink
