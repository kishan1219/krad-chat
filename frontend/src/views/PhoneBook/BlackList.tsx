// @ts-nocheck
/* eslint-disable no-unused-vars */
import { ThemeColors } from '@src/utility/context/ThemeColors'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import { forwardRef, useCallback, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, Download, Plus, RefreshCcw, Search, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, Card, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Row, UncontrolledButtonDropdown, UncontrolledTooltip } from 'reactstrap'
import { blacklistDelete } from '../../redux/reducers/blacklist'
import { addBlacklist, blacklistAction, deleteBlacklist, loadBlacklist } from '../../utility/apis/blacklist'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import Shimmer from '../components/shimmers/Shimmer'
import AddBlackList from './AddBlackList'
import ImportBlackList from './ImportBlackList'

const BlackList = () => {
    const getBlackList = useSelector(a => a.blacklist.blacklist)
    const { colors } = useContext(ThemeColors)
    const dispatch = useDispatch()
    const [blacklist, setBlacklist] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue } = useForm()
    const [formVisible, setFormVisible] = useState(false)
    const [filterVisible, setFilterVisible] = useState(false)
    const [edit, setEdit] = useState(null)
    const [loading, setLoading] = useState(false)
    const [deleted, setDeleted] = useState(null)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const [failed, setFailed] = useState(null)
    const [formModal, setFormModal] = useState(false)
    const [reload, setReload] = useState(false)
    const [added, setAdded] = useState(null)
    const [importModal, setImportModal] = useState(false)
    const [filterData, setFilterData] = useState({
        per_page_record: 15
    })
    const handleImport = () => setImportModal(!importModal)
    const [rowsSelected, setRowsSelected] = useState([])
    const [resetIt, setResetIt] = useState(new Date())


    const showForm = () => {
        setFormVisible(!formVisible)
    }

    const filterForm = () => {
        setFilterVisible(!filterVisible)
    }


    const submitFilter = (d) => {
        setFilterData({
            ...d

        })

    }

    const preload = (data) => {
        loadBlacklist({
            page: currentPage,
            perPage: rowsPerPage,
            dispatch,
            success: (e) => {
                // setBlacklist(e)
            },
            loading: setLoading,
            jsonData: {
                ...filterData,
                search: filterData?.search
            }
        })
    }

    const onSubmitNew = (data) => {
        addBlacklist({
            jsonData: {
                mobile_numbers: [data?.mobile_numbers]
            },
            loading: setLoading,
            success: () => {
                showForm()
                reset()
            }
        })
    }

    useEffect(() => {
        preload()
    }, [filterData])

    const escFunction = useCallback((event) => {
        if (event.keyCode === 27) {
            setEdit(null)
            setFormVisible(false)
        }
    }, [])

    const filterFunction = useCallback((event) => {
        if (event.keyCode === 27) {
            setEdit(null)
            setFilterVisible(false)
        }
    }, [])

    const handlePagination = page => {
        setCurrentPage(page?.selected + 1)
        loadBlacklist({
            page: page.selected + 1,
            perPage: rowsPerPage,
            jsonData: filterData,
            // success: setBlacklist,
            dispatch,
            loading: setLoading
        })
    }

    useEffect(() => {
        document.addEventListener("keydown", escFunction, false)

        return () => {
            document.removeEventListener("keydown", escFunction, false)
        }
    }, [])

    useEffect(() => {
        document.addEventListener("keydown", filterFunction, false)

        return () => {
            document.removeEventListener("keydown", filterFunction, false)
        }
    }, [])

    const handleReportChange = ({ selectedRows }) => {

        const selectedR = selectedRows.map((item, index) => {
            return item.id
        })
        setRowsSelected(selectedR)

    }


    const handleReload = () => {
        setFilterData()
        preload()
    }

    const blacklistColumn = [
        {
            name: "#",
            cell: (row, index) => {
                return (rowsPerPage * (currentPage - 1)) + (index + 1)
            },
            maxWidth: "10px"
        },
        {
            name: "Mobile Number",
            selector: r => r.mobile_number,
            sortable: true,
            maxWidth: '700px'
        },

        {
            name: "actions",
            allowOverflow: true,
            minWidth: '170px',
            cell: row => {
                return (
                    <ButtonGroup>
                        <ConfirmAlert
                            title={`Delete ${row?.mobile_number} ?`}
                            color='text-warning'
                            onClickYes={() => deleteBlacklist({ id: row?.id, loading: setLoading, success: e => { setDeletedId(row?.id); setDeleted(e) }, error: setFailed })}
                            // onClickYes={() => deletePrimaryRoute({ id: row?.id, loading: setLoading, success: setDeleted, error: setFailed })}
                            onSuccess={deleted}
                            onFailed={failed}

                            onClose={(e) => {
                                if (e) {
                                    dispatch(blacklistDelete(deletedId))
                                }
                                setDeleted(null)
                                setFailed(null)
                            }}
                            className="waves-effect btn btn-danger btn-sm"
                            id={`grid-delete-${row?.id}`}>
                            <Trash2 size={15} />
                        </ConfirmAlert>
                    </ButtonGroup >
                )
            }
        }
    ]


    const CustomPagination = () => {
        const count = Math.ceil(getBlackList?.total / getBlackList?.per_page)
        return (
            <ReactPaginate
                initialPage={getBlackList?.current_page - 1}
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
    const submitHandler = (type) => {
        // e.preventDefault()
        if (rowsSelected.length > 0) {
            // if (isObjEmpty(errors)) {
            blacklistAction({
                // id: edit?.id,
                jsonData: {
                    // status: 1,
                    // action: type === 1 ? "refund_applicable" : "retry_applicable",
                    blacklists_id: rowsSelected

                },
                loading: setLoading,
                dispatch,
                success: () => {
                    // preload()
                    setRowsSelected([])
                }
            })
            // }
        }
    }
    const BootstrapCheckbox = forwardRef((props, ref) => (
        <div className='form-check'>
            <Input type='checkbox' innerRef={ref} {...props} />
        </div>
    ))
    return (
        <>
            {/* <Header> */}
            {/* Tooltips */}
            <Header title={"Blacklist"}>
                <ButtonGroup>
                    <UncontrolledTooltip target="import">Import BlackList</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="primary" id="import" onClick={() => handleImport()}>
                        <Download size="14" on /> Import
                    </Button.Ripple>
                    <UncontrolledTooltip target="add">Add BlackList</UncontrolledTooltip>
                    <AddBlackList Component={Button.Ripple} size="sm" color={"dark"} preload={preload} id="add" ><Plus size='14' />  Add BlackList</AddBlackList>


                    {/* <Show IF={filterVisible}>
                        <div className="animate__animated animate__bounceInLeft animate__faster" >
                            <Form className="me-1" onSubmit={handleSubmit(submitFilter)}>
                                <FormGroupCustom
                                    noLabel
                                    placeholder="Filter"
                                    type={"number"}
                                    name={"mobile_number"}
                                    control={control}
                                    errors={errors}
                                    setValue={setValue}
                                    bsSize="sm"
                                    rules={{ required: true, maxLength: 12, pattern: Patterns.NumberOnly }}
                                    append={<>
                                        <LoadingButton tooltip="Filter" loading={loading} type="submit" size="sm" color="primary">
                                            <Sliders size="14" />
                                        </LoadingButton>
                                    </>}
                                />
                            </Form>
                        </div>
                    </Show> */}


                    {/* <BsTooltip title={filterVisible ? "Close" : "Filter"} Tag={Button.Ripple} onClick={filterForm} size="sm" color={filterVisible ? "danger" : "primary"} >
                        <Show IF={filterVisible}>
                            <X size="14" />
                        </Show>
                        <Hide IF={filterVisible}>
                            <Sliders size="14" />
                        </Hide>
                    </BsTooltip> */}

                    <UncontrolledTooltip target="reload"> Refresh Data</UncontrolledTooltip>
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true); setResetIt(new Date()); reset() }} >
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>

            <Card>

                <Row className='justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md='3' sm='12'>
                        <CardHeader>
                            <UncontrolledButtonDropdown disabled={rowsSelected?.length === 0}>
                                <DropdownToggle color={rowsSelected?.length === 0 ? 'secondary' : 'primary'} outline caret>
                                    Actions
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => { submitHandler() }} href='/' tag='span'>Delete</DropdownItem>

                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        </CardHeader>
                    </Col>
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
                {/* </CardHeader> */}
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
                                columns={blacklistColumn}
                                noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                    No Record Found
                                </div>}
                                selectableRowsComponent={BootstrapCheckbox}
                                sortIcon={<ChevronDown size={10} />}
                                paginationComponent={CustomPagination}
                                data={getBlackList?.data}
                                onSelectedRowsChange={handleReportChange}
                            />
                        </div>
                    </div>
                </>
                }
                {/* <Row>
                    <Col md="5">
                        <BlackListAction edit handleReportChange={handleReportChange} rowsSelected={rowsSelected} preload={preload} />
                    </Col>
                </Row> */}

            </Card>
            <ImportBlackList
                importModal={importModal}
                setImportModal={setImportModal}
                handleImport={handleImport}
                filterData={filterData}
            />

        </>
    )
}

export default BlackList
