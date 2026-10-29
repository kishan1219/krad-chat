// @ts-nocheck
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Edit, Edit2, MoreVertical, Plus, RefreshCcw, Save, Server, Trash, Trash2, X } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonGroup, Card, CardBody, Col, Form, Row, UncontrolledTooltip } from 'reactstrap'
import { IconSizes, Patterns } from '../../utility/Const'
import Hide from '../../utility/Hide'
import Show from '../../utility/Show'
import LoadingButton from '../components/buttons/LoadingButton'
import FormGroupCustom from '../components/formGroupCustom'
import Header from '../components/header'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import BsTooltip from '../components/tooltip'
import { addInvalidSeries, loadInvalidSeries, deleteInvalidSeries } from '../../utility/apis/invalidSeries'
import { useDispatch, useSelector } from 'react-redux'
import { getInitials, isValidArray, log } from '../../utility/helpers/common'
import { Avatar } from '@mui/material'
import ConfirmAlert from '../../utility/helpers/ConfirmAlert'
import TableGrid from '../components/tableGrid'
import { deleteRole, loadRole } from '../../utility/apis/roleList'
import { roleDelete } from '../../redux/reducers/role'
import DropDownMenu from '../components/dropdown'
import AddRole from './AddRole'
import ConfirmStop from '../../utility/helpers/ConfirmStop'

const RoleList = () => {
    const roleList = useSelector(a => a.role.role)
    const { colors } = useContext(ThemeColors)
    const { formState: { errors }, handleSubmit, control, reset, setValue } = useForm()
    const [formVisible, setFormVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [perPage, setPerPage] = useState(15)
    const [reload, setReload] = useState(false)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage, setRowsPerPage] = useState("2")
    const [deleted, setDeleted] = useState(false)
    const [editData, setEditData] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [filterData, setFilterData] = useState(null)

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const showForm = () => {
        setFormVisible(!formVisible)
    }

    const dispatch = useDispatch()

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

    const gridView = (item, index) => {
        // log("item", item)
        return (<>
            <Card className='flex-1'>
                <CardBody className="">
                    <Row className="align-items-center">
                        <Col xs="2">
                            <Avatar

                                style={{ backgroundColor: "secondary" }}
                                content={getInitials(item?.actual_name)}
                            />
                        </Col>
                        <Col xs="6">

                            <p className="text-truncate m-0 text-dark"
                                title={item?.actual_name}>
                                {item?.actual_name}
                            </p>

                        </Col>

                        <Col xs="4" className="d-flex align-items-end justify-content-end">
                            <ButtonGroup>
                                <Button.Ripple className="btn btn-primary btn-sm" onClick={() => { setShowModal(true); setEditData(item) }}>
                                    <Edit size={15} />
                                </Button.Ripple>
                               
                                <ConfirmStop
                                    item={item}
                                    // eventId={`delete-template-${item?.id}`}
                                    title={`Delete  ${item?.name} ?`}
                                    color='text-warning'
                                    onClickYes={() => { deleteRole({ id: item?.id }) }}
                                    onSuccessEvent={(item) => {
                                       dispatch(roleDelete(item?.id)); setFilterData({}); setReload(true)
                                    }}
                                    onFailedEvent={((item) => {  })}
                                    className="btn btn-danger btn-sm"
                                    id={`grid-delete-${item?.id}`}>
                                    <Trash2 size={15} /> 
                                </ConfirmStop>
                             
                            </ButtonGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

        </>)
    }

    return (
        <>
            <AddRole Component={Button.Ripple} edit={editData} color={"secondary"} showModal={showModal} setShowModal={() => setShowModal(false)} noView />
            <Header icon={""} title="Role List">
                <ButtonGroup>
                    <UncontrolledTooltip target="reload">Refresh Data</UncontrolledTooltip>
                    <AddRole Component={Button.Ripple} size="sm" color={"primary"} id="add" > <Plus size='14' /> Add Role</AddRole>
                   
                    <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => { setFilterData({}); setReload(true) }}>
                        <RefreshCcw size="14" />
                    </Button.Ripple>
                </ButtonGroup>
            </Header>
            <TableGrid
                refresh={reload}
                isRefreshed={setReload}
                loadFrom={loadRole}
                jsonData={filterData}
                selector={"role"}
                state="role"
                display="grid"
                gridCol="4"
                gridView={gridView}
            />

        </>
    )
}

export default RoleList
