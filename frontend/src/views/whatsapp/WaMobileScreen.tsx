// @ts-nocheck
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { ChevronDown, RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ButtonGroup, CardBody, Input, UncontrolledTooltip } from 'reactstrap'
import CenteredModal from '../components/modal/CenteredModal'
import Header from '../components/header'
import classNames from 'classnames'
import { waSendMessage, waThreadMessage, waThreadMessageCaseWise } from '../../utility/apis/whatsappConversation'
import { log } from '../../utility/helpers/common'

export default function WaMobileScreen({ edit = null, preload, noView = false, modal = false, setModal = () => { }, Component = "span", showModal = false, setShowModal = () => { }, children = null, ...rest }) {
    const [open, setOpen] = useState(false)
    const form = useForm()
    const [loading, setLoading] = useState(false)
    const [editData, setEditData] = useState(null)
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form
    const [id, setId] = useState(null)
    const [thread, setThread] = useState(null)
    const loginUser = useSelector(state => state.auth.userData)
    const conversationEndRef = useRef(null)

    const scrollToBottom = () => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleShow = () => {
        reset()
        setThread(null)
        setOpen(!open)
        setModal(!open)
        if (edit === null) setEditData(null)

    }
    const handleClose = (from = null) => {
        handleShow()
        setShowModal(false)

    }
    useEffect(() => {
        setId(edit?.id)
    }, [edit])

    useEffect(() => {
        if (showModal) handleShow()
    }, [showModal])

    log(edit, 'mobile edit')


    const chatContainerRef = useRef(null)

    const loadChat = () => {
        waThreadMessageCaseWise({
            loading: setLoading,
            jsonData: {
                queue_history_unique_key: edit?.unique_key,
                per_page_record: 10
            },
            success: (e) => {
                setThread(e)
                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
                    }
                }, 200) // Delay to ensure DOM has rendered

            }
        })
    }

    useEffect(() => {
        if (showModal) {
            loadChat()
        }
    }, [edit, showModal])

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [thread])


    // const renderChats = () => {
    //     // if (!Array.isArray(thread?.data)) {
    //     //     return null // or return some fallback UI
    //     // }

    //     return thread?.data?.data?.slice().reverse().map((item, index) => {
    //         return (
    //             <div
    //                 key={index}
    //                 className={classNames({
    //                     'chat-left': item.is_vendor_reply !== 1,
    //                     chat: item.is_vendor_reply === 1
    //                 })}
    //             >
    //                 {/* <div key={index} className={classnames({
    //                     'chat-left': item.is_vendor_reply !== 1,
    //                     chat: item.is_vendor_reply === 1
    //                 })}>
    //                     <p>{item?.profile_name}</p>
    //                 </div> */}
    //                 <div className='chat-avatar'>
    //                     <Avatar
    //                         imgWidth={36}
    //                         imgHeight={36}
    //                         content={item.profile_name} initials
    //                         color='light-primary'

    //                         className='box-shadow-1 cursor-pointer'
    //                     // img={item.senderId === 11 ? userProfile.avatar : selectedUser.contact.avatar}
    //                     />
    //                 </div>

    //                 <div className='chat-body'>
    //                     <div className='chat-content'>
    //                         <p>
    //                             <small className='fw-bold' style={{ color: 'darkgreen' }}>{item?.profile_name}</small>
    //                             <br />
    //                             {item.message}
    //                             <br />
    //                             <small>{item?.received_date}</small>
    //                         </p>
    //                     </div>
    //                 </div>
    //             </div>
    //         )
    //     })
    // }
    // console.log(edit, "log")
    // send message
    const sendMessage = (data) => {
        waSendMessage({
            jsonData: {
                ...data,
                message: data?.user_message,
                // type: checkFileType(fileSelected),
                user_id: thread?.data?.data?.[0]?.user_id,
                type: 'text',
                whats_app_reply_thread_id: edit?.whats_app_reply_threads[0]?.id,
                whats_app_configuration_id: thread?.data?.data?.[0]?.whats_app_send_sms?.whats_app_configuration_id
            },
            success: (e) => {
                loadChat()
            },
            errors: (e) => {

            }
        })

    }

    const renderChats = () => {

        return thread?.data?.data?.map(e => {

            if (edit?.mobile === e?.phone_number_id) {
                // sender
                return (
                    <div key={e.id}>
                        <div class="message received p-1">
                            <p className=' font-weight-bold' style={{ marginBottom: 5 }}>
                                <strong>{e?.profile_name}</strong>
                            </p>
                            {e?.message}
                            <span class="metadata">
                                <span class="time"></span><span class="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7" /></svg></span>
                            </span>
                        </div>
                    </div>
                )
            } else {
                // recevier
                return (
                    <div key={e.id}>
                        <div class="message sent p-1">
                            <p className=' font-weight-bold' style={{ marginBottom: 5 }}>
                                <strong>{e?.profile_name}</strong>
                            </p>
                            {e?.message}
                            <span class="metadata"><span class="time"></span></span>
                        </div>
                    </div>
                )
            }

        })
    }
    const userMessage = document.getElementById("user_message")?.value

    return (
        <>
            {!noView ? <Component role="button" onClick={handleShow} {...rest}>{children}</Component> : null}
            <CenteredModal
                disableHeader
                loading={loading}
                open={open}
                scrollControl={false}
                disableFooter={true}
                handleModal={handleClose}
                modalClass="modal-wa"
                
                // handleSave={handleSubmit(handleSave)}
                disableSave={loading}
                hideSave={true}
                title={'Whatsapp Thread'}>

                <>
                    <div class="page">
                        <div class="marvel-device nexus5">
                            <div class="top-bar"></div>
                            <div class="sleep"></div>
                            <div class="volume"></div>
                            <div class="camera"></div>
                            <div class="screen">
                                <div class="screen-container">
                                    <div class="status-bar">
                                        <div class="time"></div>
                                        <div class="battery">
                                            <i class="zmdi zmdi-battery"></i>
                                        </div>
                                        <div class="network">
                                            <i class="zmdi zmdi-network"></i>
                                        </div>
                                        <div class="wifi">
                                            <i class="zmdi zmdi-wifi-alt-2"></i>
                                        </div>
                                        <div class="star">
                                            <i class="zmdi zmdi-star"></i>
                                        </div>
                                    </div>
                                    <div class="chat">
                                        <div class="chat-container">
                                            <div class="user-bar">
                                                <div class="back">
                                                    <i class="zmdi zmdi-arrow-left"></i>
                                                </div>
                                                <div class="avatar d-flex justify-content-center align-items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16 16"><path fill="currentColor" d="M11 7c0 1.66-1.34 3-3 3S5 8.66 5 7s1.34-3 3-3s3 1.34 3 3" /><path fill="currentColor" fill-rule="evenodd" d="M16 8c0 4.42-3.58 8-8 8s-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8M4 13.75C4.16 13.484 5.71 11 7.99 11c2.27 0 3.83 2.49 3.99 2.75A6.98 6.98 0 0 0 14.99 8c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 2.38 1.19 4.49 3.01 5.75" clip-rule="evenodd" /></svg>
                                                </div>
                                                <div class="name">
                                                    <span>
                                                        {edit?.mobile}
                                                    </span>
                                                </div>
                                                <div class="actions more cursor-pointer" onClick={e => handleClose()}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" /><path fill="currentColor" d="m12 14.122l5.303 5.303a1.5 1.5 0 0 0 2.122-2.122L14.12 12l5.304-5.303a1.5 1.5 0 1 0-2.122-2.121L12 9.879L6.697 4.576a1.5 1.5 0 1 0-2.122 2.12L9.88 12l-5.304 5.304a1.5 1.5 0 1 0 2.122 2.12z" /></g></svg>
                                                </div>
                                                <div class="actions attachment">
                                                    <i class="zmdi zmdi-attachment-alt"></i>
                                                </div>
                                                <div class="actions">
                                                    <i class="zmdi zmdi-phone"></i>
                                                </div>
                                            </div>
                                            <div class="conversation">
                                                {/* <div class="conversation-container" style={{ minHeight: 300, maxHeight: 300, msOverflowY: 'auto' }}>
                                                    {renderChats()}
                                                </div> */}
                                                {/* <div className="conversation-container" style={{ minHeight: 300, maxHeight: 300, overflowY: 'auto' }}>
                                                    {renderChats()}
                                                    <div ref={conversationEndRef} />
                                                </div> */}
                                                <div
                                                    className="conversation-container"
                                                    ref={chatContainerRef}
                                                    style={{ minHeight: 300, maxHeight: 300, overflowY: 'auto' }}
                                                >
                                                    {renderChats()}
                                                </div>

                                                <form
                                                    method='post'
                                                    className="conversation-compose"
                                                    style={{
                                                        pointerEvents: Array.isArray(thread?.data?.data) && thread?.data?.data.length === 0 ? "none" : "auto"
                                                    }}
                                                    onSubmit={e => {
                                                        e.preventDefault()
                                                        const message = e.target?.elements?.user_message?.value

                                                        if (!message || message.length === 0) return

                                                        setThread({
                                                            ...thread,
                                                            data: {
                                                                ...thread?.data,
                                                                data: [
                                                                    ...(Array.isArray(thread?.data?.data) ? thread.data.data : []),
                                                                    {
                                                                        id: Math.random() * 1000,
                                                                        message,
                                                                        phone_number_id: edit?.mobile
                                                                    }
                                                                ]
                                                            }
                                                        })
                                                        sendMessage({
                                                            user_message: message,
                                                            phone_number_id: edit?.mobile
                                                        })
                                                        e.target.elements.user_message.value = ''
                                                    }}
                                                >
                                                    <div className="emoji">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" id="smiley" x="3147" y="3209"><path fillRule="evenodd" clipRule="evenodd" d="M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027-.307-.132 5.218 6.062 5.55 6.066-.25 6.066-5.55 6.066-5.55-6.078 1.416-12.13 0-12.13 0zm11.362 1.108s-.67 1.96-5.05 1.96c-3.506 0-5.39-1.165-5.608-1.96 0 0 5.912 1.055 10.658 0zM11.804 1.01C5.61 1.01.978 6.034.978 12.23s4.826 10.76 11.02 10.76S23.02 18.424 23.02 12.23c0-6.197-5.02-11.22-11.216-11.22zM12 21.355c-5.273 0-9.38-3.886-9.38-9.16 0-5.272 3.94-9.547 9.214-9.547a9.548 9.548 0 0 1 9.548 9.548c0 5.272-4.11 9.16-9.382 9.16zm3.108-9.75c.795 0 1.44-.88 1.44-1.963s-.645-1.96-1.44-1.96c-.795 0-1.44.878-1.44 1.96s.645 1.963 1.44 1.963z" fill="#7d8489" /></svg>
                                                    </div>
                                                    <input className="input-msg" name="user_message" id="user_message" placeholder="Type a message" autoComplete="off" autoFocus />
                                                    <div className="photo">
                                                        <i className="zmdi zmdi-camera"></i>
                                                    </div>
                                                    <button className="send">
                                                        <div className="circle">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20.04 2.323c1.016-.355 1.992.621 1.637 1.637l-5.925 16.93c-.385 1.098-1.915 1.16-2.387.097l-2.859-6.432l4.024-4.025a.75.75 0 0 0-1.06-1.06l-4.025 4.024l-6.432-2.859c-1.063-.473-1-2.002.097-2.387z" /></svg>
                                                        </div>
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>

                {/* {loading ? <>
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
                                        columns={mediaColumn}
                                        selectableRowsSingle={true}
                                        noDataComponent={<div className="nodata-class" style={{ padding: "2rem" }}>
                                            No Record Found
                                        </div>}
                                        selectableRowsComponent={BootstrapCheckbox}
                                        sortIcon={<ChevronDown size={10} />}
                                        paginationComponent={CustomPagination}
                                        data={media?.data}
                                        onSelectedRowsChange={handleReportChange}
                                    />
                                </div>
                            </div>
                        </>
                        } */}

            </CenteredModal>
        </>
    )
}
