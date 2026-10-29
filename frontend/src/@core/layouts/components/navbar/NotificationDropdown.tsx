// @ts-nocheck
// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Bell, X, Check, AlertTriangle, File, CheckSquare } from 'react-feather'

// ** Reactstrap Imports
import { Button, Badge, Input, DropdownMenu, DropdownItem, DropdownToggle, UncontrolledDropdown } from 'reactstrap'
import { useDispatch } from 'react-redux'
import { loadNotification, readAllNotification, unreadNotification } from '../../../../utility/apis/notification'
import { isValid, isValidArray, log } from '../../../../utility/helpers/common'
import { fromNow } from '../../../../utility/Utils'
import BsTooltip from '../../../../views/components/tooltip'
import { useNavigate } from 'react-router-dom'
import Show from '../../../../utility/Show'

const NotificationDropdown = () => {

    const [notification, setNotification] = useState(null)
    const [perPage, setPerPage] = useState(10)
    const [unreadNotifications, setUnreadNotifications] = useState(null)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [currentPage, setCurrentPage] = useState("1")
    const [rowsPerPage] = useState("15")
    const dispatch = useDispatch()

    const listNotification = () => {
        loadNotification({
            page: currentPage,
            perPage: rowsPerPage,
            loading: setLoading,
            // dispatch,
            success: (e) => {
                setNotification(e?.data)
                // log(notification)
            }

        })
    }

    const readNotificationList = () => {
        unreadNotification({

            loading: setLoading,
            // dispatch,
            success: (e) => {
                setUnreadNotifications(e)
                // log("unread", e?.unreadNotifications)
            }

        })
    }
    const navigate = useNavigate()

    const linkToNotification = () => {
        navigate('/notification')
    }

    useEffect(() => {
        listNotification()
        readNotificationList()
    }, [])

    const readAllTheNotification = (item) => {
        readAllNotification({
            // id: item,
            jsonData: {
                // ...data
            },
            success: (e) => {
                // listNotification()
                readNotificationList()
            }
            // dispatch
        })
    }

    // useEffect(() => {
    //     setInterval(() => {
    //         readNotificationList()

    //     }, 10000)

    // }, [])
    useEffect(() => {
        readNotificationList()

    }, [])
    // ** Notification Array
    const notificationsArray = [
        {
            img: require('@src/assets/images/portrait/small/avatar-s-15.jpg').default,
            subtitle: 'Won the monthly best seller badge.',
            title: (
                <p className='media-heading'>
                    <span className='fw-bolder'>Congratulation Sam 🎉</span>winner!
                </p>
            )
        },
        {
            img: require('@src/assets/images/portrait/small/avatar-s-3.jpg').default,
            subtitle: 'You have 10 unread messages.',
            title: (
                <p className='media-heading'>
                    <span className='fw-bolder'>New message</span>&nbsp;received
                </p>
            )
        },
        {
            avatarContent: 'MD',
            color: 'light-danger',
            subtitle: 'MD Inc. order updated',
            title: (
                <p className='media-heading'>
                    <span className='fw-bolder'>Revised Order 👋</span>&nbsp;checkout
                </p>
            )
        },
        {
            title: <h6 className='fw-bolder me-auto mb-0'>System Notifications</h6>,
            switch: (
                <div className='form-check form-switch'>
                    <Input type='switch' name='customSwitch' id='exampleCustomSwitch' defaultChecked />
                </div>
            )
        },
        {
            avatarIcon: <X size={14} />,
            color: 'light-danger',
            subtitle: 'USA Server is down due to hight CPU usage',
            title: (
                <p className='media-heading'>
                    <span className='fw-bolder'>Server down</span>&nbsp;registered
                </p>
            )
        },
        {
            avatarIcon: <Check size={14} />,
            color: 'light-success',
            subtitle: 'Last month sales report generated',
            title: (
                <p className='media-heading'>
                    <span className='fw-bolder'>Sales report</span>&nbsp;generated
                </p>
            )
        },
        {
            avatarIcon: <AlertTriangle size={14} />,
            color: 'light-warning',
            subtitle: 'BLR Server using high memory',
            title: (
                <p className='media-heading'>
                    <span className='fw-bolder'>High memory</span>&nbsp;usage
                </p>
            )
        }
    ]


    // ** Function to render Notifications
    /*eslint-disable */
    // const renderNotificationItems = () => {
    //     return (
    //         <PerfectScrollbar
    //             component='li'
    //             className='media-list scrollable-container'
    //             options={{
    //                 wheelPropagation: false
    //             }}
    //         >
    //             {notificationsArray.map((item, index) => {
    //                 return (
    //                     <a
    //                         key={index}
    //                         className='d-flex'
    //                         href={item.switch ? '#' : '/'}
    //                         onClick={e => {
    //                             if (!item.switch) {
    //                                 e.preventDefault()
    //                             }
    //                         }}
    //                     >
    //                         <div
    //                             className={classnames('list-item d-flex', {
    //                                 'align-items-start': !item.switch,
    //                                 'align-items-center': item.switch
    //                             })}
    //                         >
    //                             {!item.switch ? (
    //                                 <Fragment>
    //                                     <div className='me-1'>
    //                                         <Avatar
    //                                             {...(item.img
    //                                                 ? { img: item.img, imgHeight: 32, imgWidth: 32 }
    //                                                 : item.avatarContent
    //                                                     ? {
    //                                                         content: item.avatarContent,
    //                                                         color: item.color
    //                                                     }
    //                                                     : item.avatarIcon
    //                                                         ? {
    //                                                             icon: item.avatarIcon,
    //                                                             color: item.color
    //                                                         }
    //                                                         : null)}
    //                                         />
    //                                     </div>
    //                                     <div className='list-item-body flex-grow-1'>
    //                                         {item.title}
    //                                         <small className='notification-text'>{item.subtitle}</small>
    //                                     </div>
    //                                 </Fragment>
    //                             ) : (
    //                                 <Fragment>
    //                                     {item.title}
    //                                     {item.switch}
    //                                 </Fragment>
    //                             )}
    //                         </div>
    //                     </a>
    //                 )
    //             })}
    //         </PerfectScrollbar>
    //     )
    // }


    const renderNotificationItems = () => {
        return (
            <PerfectScrollbar
                component='li'
                className='media-list scrollable-container'
                options={{
                    wheelPropagation: false
                }}
            >
                {unreadNotifications?.data?.notifications?.map((item, index) => {
                    return (
                        <>
                            <a>
                                <div
                                    className={classnames('list-item d-flex align-items-center', { read: item?.read_status })}
                                >
                                    <Fragment>
                                        <div className='me-1'>
                                            <Avatar color={item?.read_at === null ? `light-info` : 'light-secondary'} icon={
                                                <File size={14} />
                                            } />
                                        </div>
                                        <div className='list-item-body flex-grow-1'>
                                            <p className='media-heading'>
                                                <span className="fw-bolder">
                                                    {item?.title}
                                                </span>
                                            </p>
                                            <p className='notification-text text-small-12 mb-0 mt-5px'>{item?.data?.message}</p>
                                            <p className='text-small-12 notification-text mb-0 mt-3px'>
                                                {fromNow(item?.created_at)}
                                            </p>
                                        </div>
                                    </Fragment>
                                </div>
                            </a>
                        </>
                    )
                })}
            </PerfectScrollbar>
        )
    }
    /*eslint-enable */

    return (
        <UncontrolledDropdown tag='li' className='dropdown-notification nav-item me-25'>
            <DropdownToggle tag='a' className='nav-link' href='/' onClick={e => e.preventDefault()}>
                <Bell size={21} />
                <Badge pill color='danger' className='badge-up'>
                    {unreadNotifications?.data?.counts}
                </Badge>
            </DropdownToggle>
            <DropdownMenu end tag='ul' className='dropdown-menu-media mt-0'>
                <li className='dropdown-menu-header'>
                    <DropdownItem className='d-flex' tag='div' header>
                        <h4 className='notification-title mb-0 me-auto'>Notifications</h4>
                        {/* <Badge tag='div' color='light-primary' pill> */}
                        <BsTooltip title={"Mark all read"} role="button">
                            <CheckSquare size={20} onClick={() => {
                                readAllTheNotification()
                            }} />
                        </BsTooltip>
                        {/* </Badge> */}
                    </DropdownItem>
                </li>
                {renderNotificationItems()}
                <Show IF={isValidArray(unreadNotifications?.data?.notifications)}>
                    <li className='dropdown-menu-footer'>
                        <Button color='primary' block onClick={() => { linkToNotification() }}>
                            View all notifications
                        </Button>
                    </li>
                </Show>
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}

export default NotificationDropdown
