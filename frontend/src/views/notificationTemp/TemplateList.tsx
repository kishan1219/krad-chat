// @ts-nocheck
import Airplay from '@mui/icons-material/Airplay'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import React, { useContext, useEffect, useState } from 'react'
import { Edit, Eye, MoreVertical, Plus, RefreshCcw, Sliders, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Button, ButtonGroup, Card, CardBody, Col, Row } from 'reactstrap'
import { IconSizes } from '../../utility/Const'
import { deleteNotificationTemp, loadNotificationTemp } from '../../utility/apis/notificationTemplate'
import ConfirmStop from '../../utility/helpers/ConfirmStop'
import { log } from '../../utility/helpers/common'
import DropDownMenu from '../components/dropdown'
import Header from '../components/header'
import TableGrid from '../components/tableGrid'
import AddTemplate from './AddTemplate'
import FilterTemplate from './FilterTemplate'
import ViewTemplate from './ViewTemplate'

const TemplateList = () => {
    const [loading, setLoading] = useState(false)
    const { colors } = useContext(ThemeColors)

    const [showFilter, setShowFilter] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [failed, setFailed] = useState(false)
    const [deletedId, setDeletedId] = useState(null)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const { setError } = useForm()
    const [reload, setReload] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [editData, setEditData] = useState([])
    const [viewTemp, setViewTemp] = useState(false)
    const [rowsSelected, setRowsSelected] = useState([])
    const [edit, setEdit] = useState(null)
    const [filterData, setFilterData] = useState({
        // email: "",
        // mobile: "",
        // name: "",
        // status: "",
        // username: ""
    })

    const dispatch = useDispatch()
    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])


    const gridView = (item, index) => {
        return (
            <>
                <div className='w-100'>
                    <Card className="animate__animated animate__fade">
                        <CardBody>
                            <Row noGutters className='align-items-center'>

                                <Col xs="11" className='d-flex align-items-center '>
                                    <div className='w-100'>
                                        <h5 className='mb-3px fw-bolder text-primary text-truncate'>
                                            <span className='position-relative'>
                                                {item?.notification_for ?? 'N/A'}
                                            </span>
                                        </h5>

                                    </div>
                                </Col>

                                {/* <Show IF={userType === UserTypes.company || userType === UserTypes.employee || userType === UserTypes.branch} > */}
                                <Col xs="1" className='d-flex justify-content-end align-items-centers'>
                                    <DropDownMenu
                                        tooltip={"Menu"}
                                        component={
                                            <MoreVertical color={colors.primary.main} size={IconSizes.MenuVertical} />
                                        }
                                        options={[
                                            {
                                                // IF: Permissions.ipSelfRead,
                                                icon: <Eye size={14} />,
                                                onClick: () => {
                                                    setViewTemp(!viewTemp)
                                                    setEdit(item)
                                                },
                                                name: "view"
                                            },
                                            {
                                                // IF: Permissions.ipSelfEdit,
                                                icon: <Edit size={14} />,
                                                name: "Edit",
                                                onClick: () => {
                                                    setEditModal(!editModal)
                                                    setEdit(item)
                                                }
                                            },
                                            {
                                                IF: item?.is_deletable === 1,
                                                noWrap: true,
                                                name: <ConfirmStop
                                                    item={item}
                                                    // eventId={`delete-template-${item?.id}`}
                                                    title={`Delete  ${item?.notification_for} ?`}
                                                    color='text-warning'
                                                    onClickYes={() => { deleteNotificationTemp({ id: item?.id }) }}
                                                    onSuccessEvent={(item) => {
                                                       setFilterData({

                                                        }); setReload(true)
                                                    }}
                                                    onFailedEvent={((item) => {  })}
                                                    className="dropdown-item"
                                                    id={`grid-delete-${item?.id}`}>
                                                    <Trash2 size={15} /> <span className='ms-1 align-middle'>Delete</span>
                                                </ConfirmStop>
                                            }
                                            
                                        ]}
                                    />
                                </Col>
                                {/* </Show> */}
                            </Row>
                        </CardBody>

                        <CardBody className=' border-top'>
                            <Row className='align-items-center'>
                                <Col md="12">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Mail Subject
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-truncate'>
                                        {item?.mail_subject ?? 'N/A'}
                                    </p>
                                </Col>

                            </Row>
                        </CardBody>
                        <CardBody className=' border-top'>
                            <Row className='align-items-center'>
                                <Col md="12">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Mail Body
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-truncate'>
                                        {item?.mail_body ?? 'N/A'}
                                    </p>
                                </Col>

                            </Row>
                        </CardBody>
                        <CardBody className=' border-top'>
                            <Row className='align-items-center'>
                                <Col md="12">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Notification Subject
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-truncate'>
                                        {item?.notification_subject ?? 'N/A'}
                                    </p>
                                </Col>

                            </Row>
                        </CardBody>
                        <CardBody className=' border-top'>
                            <Row className='align-items-center'>
                                <Col md="12">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Notification Body
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-truncate'>
                                        {item?.notification_body ?? 'N/A'}
                                    </p>
                                </Col>

                            </Row>
                        </CardBody>
                        <CardBody className=' border-top'>
                            <Row className='align-items-center'>
                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Custom Attributes
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-truncate text-primary'>
                                        {item?.custom_attributes ?? 'N/A'}
                                    </p>
                                </Col>

                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Save To Database
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-truncate'>
                                        {item?.save_to_database === 0 ? 'No' : 'Yes'}
                                    </p>
                                </Col>
                                <Col md="4">
                                    <p className='mb-0 text-dark fw-bolder'>
                                        Status Code
                                    </p>
                                    <p className='mb-0 fw-bold text-secondary text-truncate'>
                                        {item?.status_code ?? 'N/A'}
                                    </p>
                                </Col>

                            </Row>
                        </CardBody>

                    </Card>
                </div>
            </>
        )
    }

    return (
        <>

            <ViewTemplate Component={Button.Ripple} edit={edit} color={"secondary"} showModal={viewTemp} setShowModal={() => setViewTemp(false)} noView />
            <AddTemplate edit={edit} size="sm" color={"primary"} showModal={editModal} setShowModal={() => setEditModal(false)} />

            <Header icon={<Airplay />} title="Notification Template">
                <ButtonGroup color="primary" className='me-25'>
                    <AddTemplate Component={Button.Ripple} size="sm" color={"primary"} id="add" > <Plus size='14' /> Add Template</AddTemplate>
                </ButtonGroup>
                <Button.Ripple size="sm" color="dark" id="filteree" className='me-25' onClick={() => setShowFilter(true)}>
                    <Sliders size="14" on />
                </Button.Ripple>
                <Button.Ripple size="sm" color="secondary" id="reload" onClick={() => {
                    setFilterData({

                    }); setReload(true)
                }} >
                    <RefreshCcw size="14" />
                </Button.Ripple>
            </Header>

            <TableGrid
                refresh={reload}
                isRefreshed={setReload}
                loadFrom={loadNotificationTemp}
                jsonData={filterData}
                selector={"notificationTemp"}
                state="notificationTemp"
                display="grid"
                gridCol="6"
                gridView={gridView}
            />
            <FilterTemplate show={showFilter} filterData={filterData} setFilterData={e => {
                setCurrentPage(1)
                setFilterData(e)
            }} handleFilterModal={() => { setShowFilter(false) }} />
        </>
    )
}

export default TemplateList
