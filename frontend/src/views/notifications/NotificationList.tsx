// @ts-nocheck
import Avatar from '@components/avatar'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { log } from '../../utility/helpers/common'

import { NotificationsOutlined } from '@mui/icons-material'
import MarkChatRead from '@mui/icons-material/MarkChatRead'
import MarkEmailRead from '@mui/icons-material/MarkEmailRead'
import NotificationsActive from '@mui/icons-material/NotificationsActive'
import { MoreVertical, RefreshCcw, Trash2 } from 'react-feather'
import { useDispatch } from 'react-redux'
import { Button, Card, CardBody, Col, Row } from 'reactstrap'
import { notificationDelete } from '../../redux/reducers/notification'
import { IconSizes } from '../../utility/Const'
import { fromNow } from '../../utility/Utils'
import { deleteNotification, getUserDeletedNotification, loadNotification, readAllNotification, readNotification } from '../../utility/apis/notification'
import ConfirmStop from '../../utility/helpers/ConfirmStop'
import DropDownMenu from '../components/dropdown'
import Header from '../components/header'
import TableGrid from '../components/tableGrid'
import BsTooltip from '../components/tooltip'

const NotificationList = () => {
    const { formState: { errors }, handleSubmit, control, reset, setValue } = useForm()
    const [reload, setReload] = useState(false)
    const { colors } = useContext(ThemeColors)
    const [filterData, setFilterData] = useState(null)

    useEffect(() => {
        if (filterData !== null) setReload(true)
    }, [filterData])

    const dispatch = useDispatch()


    const readTheNotification = (item) => {
        readNotification({
            id: item,
            jsonData: {
                // ...data
            },

            success: (e) => {
                setFilterData({})
            }

            // dispatch
        })
    }
    const readAllTheNotification = (item) => {
        readAllNotification({
            // id: item,
            jsonData: {
                // ...data
            },
            success: (e) => {
                setFilterData({})

            }
            // dispatch
        })
    }
    const deleteALL = (item) => {
        getUserDeletedNotification({
            // id: item,
            jsonData: {
                // ...data
            },
            success: (e) => {
                setFilterData({})

            }
            // dispatch
        })
    }

    const gridView = (item, index) => {
        // log("item", item)
        return (<>
            <Card className='flex-1'>
                <CardBody className="animate__animated animate__flipInX">
                    <Row className="align-items-center">
                        <Col xs="1">
                            <div className='me-1'>
                                <Avatar color={item?.read_at === null ? `light-info` : 'light-secondary'} icon={
                                    <NotificationsOutlined size={200} />
                                } />
                            </div>
                        </Col>
                        <Col xs="10" className='d-flex align-items-center '>
                            <div className='w-100'>
                                <h5 className='mb-3px fw-bolder text-primary text-truncate'>
                                    <span className='position-relative'>
                                        {item?.title}
                                    </span>
                                </h5>
                               
                                <p className='mb-0 text-small-12 '>
                                    {fromNow(item?.created_at)}
                                </p>
                            </div>
                        </Col>

                        <Col xs="1" className='d-flex justify-content-end align-items-centers'>
                            <DropDownMenu
                                tooltip={"Menu"}
                                component={
                                    <MoreVertical color={colors.primary.main} size={IconSizes.MenuVertical} />
                                }
                                options={[
                                    {
                                        IF: item?.read_at === null,
                                        icon: <MarkChatRead size={14} />,
                                        onClick: () => {
                                            // setViewTemp(!viewTemp)
                                            // setEdit(item)
                                            readTheNotification(item?.id)
                                        },
                                        name: "Read"
                                    },
                                    {
                                        noWrap: true,
                                        name: <ConfirmStop
                                            item={item}
                                            // eventId={`delete-template-${item?.id}`}
                                            title={`Delete  ${item?.title} ?`}
                                            color='text-warning'
                                            onClickYes={() => { deleteNotification({ id: item?.id }) }}
                                            onSuccessEvent={(item) => {
                                                dispatch(notificationDelete(item?.id)); setFilterData({}); setReload(true)
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
                    </Row>
                </CardBody>
                <CardBody className=' border-top'>
                    <Row className='align-items-center'>
                        <Col md="12">
                            <p className='mb-0 text-dark fw-bolder'>
                                {item?.message ?? 'N/A'}
                            </p>
                     
                        </Col>

                    </Row>
                </CardBody>
            </Card>
        </>)
    }


    return (
        <>
            <Header icon={<NotificationsActive />} title="All Notifications">
                <BsTooltip title={"Mark All as Read"}>
                    <Button.Ripple size="sm" color="danger" id="reload" className="me-25" onClick={() => {
                        deleteALL()
                    }} >
                        <Trash2 size="14" /> Delete All
                    </Button.Ripple>
                </BsTooltip>

                <BsTooltip title={"Mark All as Read"}>
                    <Button.Ripple size="sm" color="info" id="reload" className="me-25" onClick={() => {
                        readAllTheNotification()
                    }} >
                        <MarkEmailRead style={{ fontSize: 14 }} /> Read All
                    </Button.Ripple>
                </BsTooltip>

                <BsTooltip title={"Reload"}>
                    <Button.Ripple size="sm" color="primary" id="reload" onClick={() => {
                        setFilterData({

                        }); setReload(true)
                    }} >
                        <RefreshCcw size="14" /> Reload
                    </Button.Ripple>
                </BsTooltip>
            </Header>

            <TableGrid
                refresh={reload}
                isRefreshed={setReload}
                loadFrom={loadNotification}
                jsonData={filterData}
                selector={"notification"}
                state="notification"
                display="grid"
                gridCol="12"
                gridView={gridView}
            />
        </>
    )
}

export default NotificationList
