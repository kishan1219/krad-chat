// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react'
import { Plus, Save, Server, Trash, Trash2, X } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonGroup, Card, CardBody, Col, Form, Row } from 'reactstrap'
import { Patterns } from '../../utility/Const'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import BsTooltip from '../components/tooltip'
import { addInvalidSeries, loadInvalidSeries, deleteInvalidSeries } from '../../utility/apis/invalidSeries'
import { useDispatch, useSelector } from 'react-redux'
import { getInitials, isValidArray, log } from '../../utility/helpers/common'
import { Avatar } from '@mui/material'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
import { invalidDelete } from '../../redux/reducers/invalid'
import TableGrid from '../components/tableGrid'
import ConfirmStop from '../../utility/helpers/ConfirmStop'

const ListInvalidSeries = () => {
    const invalidList = useSelector(a => a.invalid.invalid)
    const { formState: { errors }, handleSubmit, control, reset, setValue } = useForm()
    const [formVisible, setFormVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [perPage, setPerPage] = useState(15)
    const [reload, setReload] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage, setRowsPerPage] = useState("2")
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [filterData, setFilterData] = useState(null)

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const showForm = () => {
        setFormVisible(!formVisible)
        reset()
    }

    const dispatch = useDispatch()

    const onSubmitNew = (data) => {
        addInvalidSeries({
            jsonData: {
                ...data
            },
            loading: setLoading,
            dispatch,
            success: (e) => {
                // handleClose()
                reset()
                showForm()
            }
        })
    }

    const escFunction = useCallback((event) => {
        if (event.keyCode === 27) {

            setFormVisible(false)
        }
    }, [])

    useEffect(() => {
        document.addEventListener("keydown", escFunction, false)

        return () => {
            document.removeEventListener("keydown", escFunction, false)
        }
    }, [])

    // const listInvalid = () => {
    //     loadInvalidSeries({
    //         page: currentPage,
    //         perPage: rowsPerPage,
    //         dispatch,
    //         success: (e) => {
    //             // setMessage(e)
    //         },
    //         loading: setLoading
    //     })
    // }

    // useEffect(() => {
    //     listInvalid()
    // }, [])


    const gridView = (item, index) => {
        // log("item", item)
        return (<>
            <Card className='flex-1'>
                <CardBody className="animate__animated animate__flipInX">
                    <Row className="align-items-center">
                        <Col xs="2">
                            <Avatar
                                // color={item?.status === 1 ? 'light-primary' : 'light-warning'}
                                style={{ backgroundColor: "secondary" }}
                                content={getInitials(item?.start_with)}
                            />
                        </Col>
                        <Col xs="6">

                            <p className="text-truncate m-0 text-dark"
                                title={item?.start_with}>
                                {item?.start_with}
                            </p>

                        </Col>

                        <Col xs="4" className="d-flex align-items-end justify-content-end">
                            {/* <ConfirmAlert
                                                title={`Delete ${item?.start_with} ?`}
                                                color='text-warning'
                                                onClickYes={() => deleteInvalidSeries({ id: item?.id, loading: setLoading, success: e => { setDeletedId(item?.id); setDeleted(e) }, error: setFailed })}

                                                onSuccess={deleted}
                                                onFailed={failed}

                                                onClose={(e) => {
                                                    if (e) {
                                                        dispatch(invalidDelete(deletedId))
                                                    }
                                                    setDeleted(null)
                                                    setFailed(null)
                                                }}
                                                className="btn btn-danger btn-sm"

                                                id={`grid-delete-${item?.id}`}>
                                                <Trash2 size={15} /> 
                                            </ConfirmAlert> */}
                            <ConfirmStop
                                item={item}
                                eventId={`delete-${item?.id}`}
                                title={`Delete  ${item?.start_with} ?`}
                                color='text-warning'
                                onClickYes={() => { deleteInvalidSeries({ id: item?.id }) }}
                                onSuccessEvent={(item) => {  dispatch(invalidDelete(item?.id)) }}
                                onFailedEvent={((item) => { })}

                                className="waves-effect btn btn-danger btn-sm"
                                id={`grid-delete-${item?.id}`}>
                                <Trash2 size={15} />
                                {/* <Trash size={15} /> <span className='ms-1 align-middle'>Delete</span> */}
                            </ConfirmStop>
                            {/* <ConfirmAlert
                                title={`Delete ${item?.start_with} ?`}
                                color='text-warning'
                                onClickYes={() => deleteInvalidSeries({ id: item?.id, loading: setLoading, success: e => { setDeletedId(item?.id); setDeleted(e) }, error: setFailed })}
                                
                                onSuccess={deleted}
                                onFailed={failed}

                                onClose={(e) => {
                                    if (e) {
                                        dispatch(invalidDelete(deletedId))
                                    }
                                    setDeleted(null)
                                    setFailed(null)
                                }}
                                className="waves-effect btn btn-danger btn-sm"
                                id={`grid-delete-${item?.id}`}>
                                <Trash2 size={15} />
                            </ConfirmAlert> */}
                            {/* <ConfirmAlert
                                        item={item}
                                        eventId={`delete-${item?.id}`}
                                        title={`Delete  ${item?.name} ?`}
                                        color='text-warning'
                                        onClickYes={() => { deleteInvalidSeries({ id: item?.id }) }}
                                        onSuccessEvent={(item) => { log("item", item); dispatch(invalidDelete(item?.id)); setReload() }}
                                        onFailedEvent={((item) => { log("item", item) })}

                                        className="dropdown-item"
                                        id={`grid-delete-${item?.id}`}>

                                        <Trash2 size={15} /> <span className='ms-1 align-middle'>Delete</span>
                                    </ConfirmAlert> */}
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>)
    }

    return (
        <>
            <Header icon={""} title={"Invalid Number Series"} >
                <ButtonGroup color='primary' className='me-25'>

                    <Show IF={formVisible}>
                        <div className="animate__animated animate__bounceInLeft animate__faster">
                            <Form className="me-1" onSubmit={handleSubmit(onSubmitNew)}>
                                <FormGroupCustom
                                    noLabel
                                    placeholder="Enter  Number"
                                    type="number"
                                    name="start_with"
                                    control={control}
                                    autofocus
                                    errors={errors}
                                    bsSize="sm"
                                    rules={{ required: true, min: 0, maxLength: 10 }}
                                    append={<>
                                        <LoadingButton tooltip="Save" loading={loading} type="submit" size="sm" color="primary">
                                            <Save size="14" />
                                        </LoadingButton>
                                    </>}
                                />
                            </Form>
                        </div>
                    </Show>

                    <BsTooltip title={formVisible ? "Close" : "Create New"} Tag={Button.Ripple} onClick={showForm} size="sm" color={formVisible ? "danger" : "primary"} >
                        <Show IF={formVisible}>
                            <X size="14" />
                        </Show>
                        <Hide IF={formVisible}>
                            <Plus size="14" />
                        </Hide>
                    </BsTooltip>

                </ButtonGroup>
            </Header>

            {/* <Row>

                {
                  isValidArray(invalidList) ? invalidList?.map((item, index) => {
                        return (
                           
                                <Col lg='3' sm='6'>
                                    <StatsHorizontal icon={<Server size={21} />}
                                        color='success' stats={item?.start_with}

                                    />
                                </Col>

                           
                        )
                    }) : ""
                }

            </Row> */}

            <TableGrid
                refresh={reload}
                isRefreshed={setReload}
                loadFrom={loadInvalidSeries}
                jsonData={filterData}
                selector={"invalid"}
                state="series"
                display="grid"
                gridCol="4"
                gridView={gridView}
            />
        </>
    )
}

export default ListInvalidSeries
