// ** React Imports
import { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

// ** Custom Components
import AvatarBase from '@components/avatar'

// ** Store & Actions
// import { sendMsg } from './store'
import { ReadyState } from 'react-use-websocket'

// ** Third Party Components
import classnames from 'classnames'
import { Download, FileText, Image, Menu, MessageSquare, Send } from 'react-feather'
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Reactstrap Imports
import {
    Button,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    UncontrolledButtonDropdown,
    Modal,
    ModalHeader,
    ModalBody,
    Card,
    CardBody
} from 'reactstrap'

import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { waDownloadFile, waSendMessage, waThreadMessageCaseWise } from '../../utility/apis/whatsappConversation'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
import httpConfig from '../../utility/http/httpConfig'
import ListWhatsapp from './Modal/ListWhatsapp'
import ImagePhoto from '../../assets/images/logo/Imagephoto.png'
import DocumentPng from '../../assets/images/logo/document.png'
import PictureAsPdf from '@mui/icons-material/PictureAsPdf'
import ImageIcon from '@mui/icons-material/Image'
import { AudioFile, Dangerous, Description, FolderZip, Slideshow, TableChart, VideoFile } from '@mui/icons-material'
import OrderDetailsModal from './OrderDetailsModal'
import InteractiveMessageModal from './InteractiveMessageModal'
import ButtonMessageModal from './ButtonMessageModal'
import LocationDisplayModal from './LocationDisplayModal'


import Link from '@mui/material/Link'
import Shimmer from '../components/shimmers/Shimmer'
import useWebSockets from '../../utility/hooks/useSocket'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { useRedux } from '../../redux/useRedux'
import { toggleRefreshContacts } from './store'
import { fetchMessage } from '../../utility/Utils'
import { CMD } from '../../utility/Const'
import { formatWhatsAppText } from '../../utility/whatsappText'
import ConversationTools from './ConversationTools'

const Avatar = AvatarBase as any
const ListWhatsappComp = ListWhatsapp as any
const RippleButton = (Button as any).Ripple || Button


const renderContactCard = (contacts) => {
    if (!contacts || contacts.length === 0) {
        return null
    }

    return (
        <div>
            {contacts.map((contact, index) => (
                <Card key={index} className="mb-1" style={{ maxWidth: '350px' }}>
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <Avatar content={contact.name.formatted_name} initials color="light-primary" />
                                <div className="ms-1">
                                    <h5 className="mb-0">{contact.name.formatted_name}</h5>
                                    {contact.phones.map((phone, i) => (
                                        <p key={i} className="text-muted mb-0 fw-bold">{phone.phone}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </CardBody>
                </Card>
            ))}
        </div>
    )
}

const formatWhatsAppMessage = (text) => {
    return formatWhatsAppText(text)
}

const renderMediaMessage = (item, downloadTheFiles) => {
    const downloadUrl = item.media_url || `${httpConfig?.baseUrl2}/${item.media_id}`

    const handleMediaClick = () => {
        if (item.media_id && !item.media_url) {
            downloadTheFiles(item.id, item.whats_app_send_sms?.whats_app_configuration_id, item?.user_id)
        }
    }

    if (item.mime_type?.includes('image') && item?.media_url === null) {
        return (
            <div style={{ display: 'inline-block', width: '175px', textAlign: 'center', cursor: 'pointer' }} onClick={handleMediaClick}>
                <div style={{
                    position: 'relative',
                    width: '175px', /* Set to match parent width */
                    height: '175px' /* Set to create a square area for the image placeholder */
                }} >
                    <ImageIcon sx={{
                        color: 'warning.main',
                        filter: 'blur(2px)',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%', /* Make icon fill its parent */
                        height: '100%' /* Make icon fill its parent */
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {item?.user_id === null ? (<>
                            <div style={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50px',
                                padding: '9px'
                            }}>

                                Unknown

                            </div>
                        </>) : (<> <div style={{
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            padding: '8px'
                        }}>

                            <Download size={20} />

                        </div>
                        </>)}
                    </div>
                </div>

                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
            </div >
        )
    } else if (item.mime_type?.includes('pdf') && item?.media_url === null) {
        return (
            <div style={{ display: 'inline-block', width: '175px', textAlign: 'center', cursor: 'pointer' }} onClick={handleMediaClick}>
                <div style={{
                    position: 'relative',
                    width: '175px', /* Set to match parent width */
                    height: '175px' /* Set to create a square area for the image placeholder */
                }} >
                    <PictureAsPdf fontSize='large' sx={{
                        color: 'warning.main',
                        filter: 'blur(2px)',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%', /* Make icon fill its parent */
                        height: '100%' /* Make icon fill its parent */
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {item?.user_id === null ? (<>
                            <div style={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50px',
                                padding: '9px'
                            }}>

                                Unknown

                            </div>
                        </>) : (<> <div style={{
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            padding: '8px'
                        }}>

                            <Download size={20} />

                        </div>
                        </>)}
                    </div>
                    <br />
                </div>
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word', display: 'inline-block' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
            </div>
        )
    } else if (item.mime_type?.includes('zip') && item?.media_url === null) {
        return (
            <div style={{ position: 'relative', display: 'inline-block', textAlign: 'center', width: '175px', cursor: 'pointer' }} onClick={handleMediaClick}>
                <FolderZip fontSize='large' sx={{
                    fontSize: '10rem',
                    color: 'warning.main',
                    filter: 'blur(2px)'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    <div style={{
                        color: 'white',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '50%',
                        padding: '8px'
                    }}>
                        <Download size={24} />
                    </div>
                </div>
                <br />
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word', display: 'inline-block' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
            </div>
        )
    } else if (item.mime_type?.includes('rar') && item?.media_url === null) {
        return (
            <div style={{ position: 'relative', display: 'inline-block', textAlign: 'center', width: '175px', cursor: 'pointer' }} onClick={handleMediaClick}>
                <FolderZip fontSize='large' sx={{
                    fontSize: '10rem',
                    color: 'warning.main',
                    filter: 'blur(2px)'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    <div style={{
                        color: 'white',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '50%',
                        padding: '8px'
                    }}>
                        <Download size={24} />
                    </div>
                </div>
                <br />
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word', display: 'inline-block' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
            </div>
        )

    } else if (item.mime_type?.includes('audio') && item?.media_url === null) {
        return (
            <div style={{ display: 'inline-block', width: '175px', textAlign: 'center', cursor: 'pointer' }} onClick={handleMediaClick}>
                <div style={{
                    position: 'relative',
                    width: '175px', /* Set to match parent width */
                    height: '175px' /* Set to create a square area for the image placeholder */
                }} >   <AudioFile fontSize='large' sx={{
                    color: 'warning.main',
                    filter: 'blur(2px)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%', /* Make icon fill its parent */
                    height: '100%' /* Make icon fill its parent */
                }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {item?.user_id === null ? (<>
                            <div style={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50px',
                                padding: '9px'
                            }}>

                                Unknown

                            </div>
                        </>) : (<> <div style={{
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            padding: '8px'
                        }}>

                            <Download size={20} />

                        </div>
                        </>)}
                    </div>
                </div>
                <br />
                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word', display: 'inline-block' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
            </div>
        )
    } else if (item.mime_type?.includes('msword') && item?.media_url === null) {
        return (
            <div style={{ display: 'inline-block', width: '175px', textAlign: 'center', cursor: 'pointer' }} onClick={handleMediaClick}>
                <div style={{
                    position: 'relative',
                    width: '175px', /* Set to match parent width */
                    height: '175px' /* Set to create a square area for the image placeholder */
                }} > <Description fontSize='large' sx={{
                    color: 'warning.main',
                    filter: 'blur(2px)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%', /* Make icon fill its parent */
                    height: '100%' /* Make icon fill its parent */
                }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {item?.user_id === null ? (<>
                            <div style={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50px',
                                padding: '9px'
                            }}>

                                Unknown

                            </div>
                        </>) : (<> <div style={{
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            padding: '8px'
                        }}>

                            <Download size={20} />

                        </div>
                        </>)}
                    </div>
                </div>
                <br />
                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word', display: 'inline-block' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
            </div>
        )
    } else if (item.mime_type?.includes('excel') && item?.media_url === null) {
        return (
            <div style={{ display: 'inline-block', width: '175px', textAlign: 'center', cursor: 'pointer' }} onClick={handleMediaClick}>
                <div style={{
                    position: 'relative',
                    width: '175px', /* Set to match parent width */
                    height: '175px' /* Set to create a square area for the image placeholder */
                }} >  <TableChart fontSize='large' sx={{
                    color: 'warning.main',
                    filter: 'blur(2px)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%', /* Make icon fill its parent */
                    height: '100%' /* Make icon fill its parent */
                }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {item?.user_id === null ? (<>
                            <div style={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50px',
                                padding: '9px'
                            }}>

                                Unknown

                            </div>
                        </>) : (<> <div style={{
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            padding: '8px'
                        }}>

                            <Download size={20} />

                        </div>
                        </>)}
                    </div>
                </div>
                <br />
                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word', display: 'inline-block' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
            </div>
        )
    } else if (item.mime_type?.includes('sheet') && item?.media_url === null) {
        return (
            <div style={{ display: 'inline-block', width: '175px', textAlign: 'center', cursor: 'pointer' }} onClick={handleMediaClick}>
                <div style={{
                    position: 'relative',
                    width: '175px', /* Set to match parent width */
                    height: '175px' /* Set to create a square area for the image placeholder */
                }} > <TableChart fontSize='large' sx={{
                    color: 'warning.main',
                    filter: 'blur(2px)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%', /* Make icon fill its parent */
                    height: '100%' /* Make icon fill its parent */
                }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {item?.user_id === null ? (<>
                            <div style={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50px',
                                padding: '9px'
                            }}>

                                Unknown

                            </div>
                        </>) : (<> <div style={{
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            padding: '8px'
                        }}>

                            <Download size={20} />

                        </div>
                        </>)}
                    </div>
                </div>
                <br />
                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word', display: 'inline-block' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
            </div>
        )
    } else if (item.mime_type?.includes('powerpoint') && item?.media_url === null) {
        return (
            <div style={{ display: 'inline-block', width: '175px', textAlign: 'center', cursor: 'pointer' }} onClick={handleMediaClick}>
                <div style={{
                    position: 'relative',
                    width: '175px', /* Set to match parent width */
                    height: '175px' /* Set to create a square area for the image placeholder */
                }} >  <Slideshow fontSize='large' sx={{
                    color: 'warning.main',
                    filter: 'blur(2px)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%', /* Make icon fill its parent */
                    height: '100%' /* Make icon fill its parent */
                }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {item?.user_id === null ? (<>
                            <div style={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50px',
                                padding: '9px'
                            }}>

                                Unknown

                            </div>
                        </>) : (<> <div style={{
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            padding: '8px'
                        }}>

                            <Download size={20} />

                        </div>
                        </>)}
                    </div>
                </div>
                <br />
                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word', display: 'inline-block' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
            </div>
        )
    } else if (item.mime_type?.includes('presentation') && item?.media_url === null) {
        return (
            <div style={{ display: 'inline-block', width: '175px', textAlign: 'center', cursor: 'pointer' }} onClick={handleMediaClick}>
                <div style={{
                    position: 'relative',
                    width: '175px', /* Set to match parent width */
                    height: '175px' /* Set to create a square area for the image placeholder */
                }} > <Slideshow fontSize='large' sx={{
                    color: 'warning.main',
                    filter: 'blur(2px)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%', /* Make icon fill its parent */
                    height: '100%' /* Make icon fill its parent */
                }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {item?.user_id === null ? (<>
                            <div style={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50px',
                                padding: '9px'
                            }}>

                                Unknown

                            </div>
                        </>) : (<> <div style={{
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            padding: '8px'
                        }}>

                            <Download size={20} />

                        </div>
                        </>)}
                    </div>
                </div>
                <br />
                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word', display: 'inline-block' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
            </div>
        )

    } else if (item.mime_type?.includes('video') && item?.media_url === null) {
        return (
            <div style={{ display: 'inline-block', width: '175px', textAlign: 'center', cursor: 'pointer' }} onClick={handleMediaClick}>
                <div style={{
                    position: 'relative',
                    width: '175px', /* Set to match parent width */
                    height: '175px' /* Set to create a square area for the image placeholder */
                }} > <VideoFile fontSize='large' sx={{
                    color: 'warning.main',
                    filter: 'blur(2px)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%', /* Make icon fill its parent */
                    height: '100%' /* Make icon fill its parent */
                }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {item?.user_id === null ? (<>
                            <div style={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50px',
                                padding: '9px'
                            }}>

                                Unknown

                            </div>
                        </>) : (<> <div style={{
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            padding: '8px'
                        }}>

                            <Download size={20} />

                        </div>
                        </>)}
                    </div>
                </div>
                <br />
                {/* <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span> */}
                <div
                    style={{ maxWidth: '155px', wordBreak: 'break-word', display: 'inline-block' }}
                    className='ck-content'
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                />
            </div>
        )
    } else {
        return (
            <div className="d-flex align-items-center" onClick={handleMediaClick} style={{ cursor: 'pointer' }}>
                <Download size={40} className="me-1" />
                <span>{item?.message || 'Download Media'}</span>
            </div>
        )
    }
}

const ChatLog = props => {
    // ** Props & Store
    const { handleUser, handleUserSidebarRight, handleSidebar, store, userSidebarLeft, userData } = props
    const { userProfile, selectedUser } = store
    const [isChatLoaded, setIsChatLoaded] = useState(false) // Track chat loading state
    const { reduxStates: { chat: { chats, refreshContacts } } } = useRedux()

    // ** Refs & Dispatch
    const chatArea = useRef<any>(null)
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)
    const [thread, setThread] = useState(null)
    // ** State
    const [msg, setMsg] = useState('')
    const [userMessage, setUserMessage] = useState(null)
    const [newMessage, setNewMessage] = useState(null)
    const form = useForm()
    const { formState: { errors }, handleSubmit, control, reset, setValue, watch, getValues, setError } = form
    const userLogin = useAppSelector(state => state.auth?.userData as any)
    const [mediaData, setMediaData] = useState(null)
    const [list, setList] = useState(false)
    const [modal, setModal] = useState(false)
    const [fileClicked, setFileClicked] = useState(null)
    const [fileSelected, setFileSelected] = useState<number>(0)
    const toggleModal = () => setModal(!modal)
    const navigate = useNavigate()
    const toggleList = () => setList(!list)
    const [avatar, setAvatar] = useState('')
    const [scroll, setScroll] = useState(true)
    const [loadingPage, setLoadingPage] = useState(0)
    const [page, setPage] = useState(1)
    const [nextCursor, setNextCursor] = useState(null)
    const [prevCursor, setPrevCursor] = useState(null)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isInteractiveModalOpen, setIsInteractiveModalOpen] = useState(false)
    const [selectedInteractive, setSelectedInteractive] = useState(null)
    const [isButtonModalOpen, setIsButtonModalOpen] = useState(false)
    const [selectedButtonMessage, setSelectedButtonMessage] = useState(null)
    const [openLocationDisplayModal, setOpenLocationDisplayModal] = useState(false)
    const [locationData, setLocationData] = useState(null)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [selectedImageSrc, setSelectedImageSrc] = useState('')
    const { readyState, lastMessage, sendMessageToUser } = useWebSockets()

    const handleOpenOrderModal = (orderData) => {
        try {
            const parsedOrder = JSON.parse(orderData)
            setSelectedOrder(parsedOrder)
            setIsOrderModalOpen(true)
        } catch (error) {
            console.error("Failed to parse order data:", error)
        }
    }

    const handleCloseOrderModal = () => {
        setIsOrderModalOpen(false)
        setSelectedOrder(null)
    }

    const handleOpenInteractiveModal = (interactiveData) => {
        try {
            const parsedInteractive = JSON.parse(interactiveData)
            setSelectedInteractive(parsedInteractive)
            setIsInteractiveModalOpen(true)
        } catch (error) {
            console.error("Failed to parse interactive data:", error)
        }
    }

    const handleCloseInteractiveModal = () => {
        setIsInteractiveModalOpen(false)
        setSelectedInteractive(null)
    }

    const handleOpenButtonModal = (buttonData) => {
        setSelectedButtonMessage(buttonData)
        setIsButtonModalOpen(true)
    }

    const handleCloseButtonModal = () => {
        setIsButtonModalOpen(false)
        setSelectedButtonMessage(null)
    }

    const handleOpenLocationDisplayModal = (locationMessage) => {
        try {
            const parsedLocation = JSON.parse(locationMessage)
            setLocationData(parsedLocation)
            setOpenLocationDisplayModal(true)
        } catch (error) {
            console.error("Failed to parse location data:", error)
        }
    }

    const handleCloseLocationDisplayModal = () => {
        setOpenLocationDisplayModal(false)
        setLocationData(null)
    }

    const handleOpenImageModal = (src) => {
        setSelectedImageSrc(src)
        setIsImageModalOpen(true)
    }

    const handleCloseImageModal = () => {
        setIsImageModalOpen(false)
        setSelectedImageSrc('')
    }


    // get clicked item from local storage
    // const userClicked = JSON.parse(localStorage.getItem('clickedItem'))

    // get userClicked from redux

    const userClicked = useAppSelector(state => (state.loadUserClick as any)?.userClicked)
    const chatDataRef = useRef<any>(null)

    // const preload = () => {
    //     waThreadMessageCaseWise({
    //         loading: setLoading,
    //         jsonData: {
    //             conversation_id: userClicked?.id,
    // phone_number: userClicked?.phone_number_id,
    //             per_page_record: 10
    //         },
    //         success: (e) => {
    //             setThread(e)
    //             setTimeout(() => {
    //                 if (chatDataRef.current) {
    //                     chatDataRef.current.scrollTop = chatDataRef.current.scrollHeight
    //                 }
    //             }, 200)
    //         }
    //     })
    // }

    // const preload = (pageNum = 1, append = false) => {
    //     waThreadMessageCaseWise({
    //         loading: pageNum === 1 ? setLoading : setLoadingMore,
    //         jsonData: {
    //             conversation_id: userClicked?.id,
    // phone_number: userClicked?.phone_number_id,
    //             per_page_record: 10,
    //             page: pageNum
    //         },
    //         success: (e) => {
    //             if (e?.data?.data?.length > 0) {
    //                 setThread(prev => ({
    //                     ...e,
    //                     data: {
    //                         ...e.data,
    //                         data: append ? [...e.data.data, ...prev.data.data] : e.data.data
    //                     }
    //                 }))

    //                 setPage(pageNum)
    //             } else {
    //                 setHasMore(false)
    //             }

    //             if (pageNum === 1) {
    //                 setTimeout(() => {
    //                     if (chatDataRef.current) {
    //                         chatDataRef.current.scrollTop = chatDataRef.current.scrollHeight
    //                     }
    //                 }, 200)
    //             }
    //         }
    //     })
    // }


    // const handleScroll = () => {
    //     if (!chatDataRef.current || loadingMore || !hasMore) return

    //     if (chatDataRef.current.scrollTop === 0) {
    //         preload(page + 1, true) 
    //     }
    // }

    // useEffect(() => {
    //     const chatElement = chatDataRef.current

    //     if (chatElement) {
    //         chatElement.addEventListener('scroll', handleScroll)
    //         return () => chatElement.removeEventListener('scroll', handleScroll)
    //     }
    // }, [page, loadingMore, hasMore])


    // const handleScroll = () => {
    //     if (!chatDataRef.current || loadingMore || !hasMore) return

    //     if (chatDataRef.current.scrollTop === 0) {
    //         preload(page + 1, true) // Load older messages and append
    //     }
    // }
    const getScrollElement = () => {
        if (chatDataRef.current) {
            // If using PerfectScrollbar, get the actual scroll container
            if (chatDataRef.current._container) {
                return chatDataRef.current._container
            }
            // Otherwise assume it's a div
            return chatDataRef.current
        }
        return null
    }

    const preload = (cursor = null, append = false, loading = true) => {
        waThreadMessageCaseWise({
            loading: loading === true ? (!cursor ? setLoading : setLoadingMore) : () => { },
            jsonData: {
                conversation_id: userClicked?.id,
                phone_number: userClicked?.phone_number_id,
                per_page_record: 25,
                cursor
            },
            success: ((e: any) => {
                if (e?.data?.data?.length > 0) {
                    let previousScrollHeight = 0
                    const scrollEl = getScrollElement()
                    if (scrollEl && cursor) {
                        previousScrollHeight = scrollEl.scrollHeight
                    }

                    setThread(prev => {
                        const allData = append ? [...e.data.data, ...prev.data.data] : e.data.data
                        const sortedData = allData.sort((a, b) => new Date(a.received_date).getTime() - new Date(b.received_date).getTime())
                        return {
                            ...e,
                            data: {
                                ...e.data,
                                data: sortedData
                            }
                        }
                    })
                    setNextCursor(e?.data?.cursor?.next)
                    setPrevCursor(e?.data?.cursor?.prev)
                    setHasMore(e?.data?.has_more)

                    if (cursor) {
                        setTimeout(() => {
                            const newScrollEl = getScrollElement()
                            if (newScrollEl) {
                                const newScrollHeight = newScrollEl.scrollHeight
                                newScrollEl.scrollTop = newScrollHeight - previousScrollHeight
                            }
                        }, 100)
                    }
                } else {
                    setHasMore(false)
                }

                if (!cursor) {
                    setTimeout(() => {
                        const scrollEl = getScrollElement()
                        if (scrollEl) {
                            scrollEl.scrollTop = scrollEl.scrollHeight
                        }
                    }, 200)
                }
                setMediaData(null)
                setFileSelected(0)
            }) as any
        } as any)
    }


    const handleScroll = () => {
        const scrollEl = getScrollElement()
        if (!scrollEl || loadingMore || !hasMore || !nextCursor) return

        if (scrollEl.scrollTop === 0) {
            preload(nextCursor, true)
        }
    }

    const downloadTheFiles = (whats_app_reply_thread_id, whats_app_configuration_id, user_id) => {
        waDownloadFile({
            jsonData: {
                whats_app_reply_thread_id,
                user_id,
                whats_app_configuration_id
            },
            success: ((e: any) => {
                preload()
                // Create a new Blob object from the response data with the correct MIME type
                const blob = new Blob([e.data], { type: e.headers['content-type'] })

                // Create a link element
                const link = document.createElement('a')

                // Set the href attribute to a URL created from the Blob
                link.href = window.URL.createObjectURL(blob)

                // Extract filename from content-disposition header
                const contentDisposition = e.headers['content-disposition']
                let filename = 'downloaded-file'
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
                    if (filenameMatch.length > 1) {
                        filename = filenameMatch[1]
                    }
                }

                // Set the download attribute to the extracted filename
                link.download = filename

                // Append the link to the body
                document.body.appendChild(link)

                // Programmatically click the link to trigger the download
                link.click()
                // Remove the link from the body
                document.body.removeChild(link)
                preload()
            }) as any,
            errors: ((e: any) => {
                const d = e?.data?.data
                for (const key in d) {
                    if (Object.hasOwnProperty.call(d, key)) {
                        if (isValidArray(d[key])) {
                            const message = d[key]?.map(a => `${a} \n`)
                            setError(key, { message, type: "validate" })
                        }
                    }
                }
            }) as any

        } as any)
    }

    useEffect(() => {
        const scrollEl = getScrollElement()

        if (scrollEl) {
            scrollEl.addEventListener('scroll', handleScroll)
            return () => scrollEl.removeEventListener('scroll', handleScroll)
        }
    }, [nextCursor, loadingMore, hasMore, userClicked])


    // useEffect(() => {
    //     const chatElement = chatDataRef.current

    //     if (chatElement) {
    //         chatElement.addEventListener('scroll', handleScroll)
    //         return () => chatElement.removeEventListener('scroll', handleScroll)
    //     }
    // }, [page, loadingMore, hasMore])


    // useEffect(() => {
    //     if (chatDataRef.current) {
    //         chatDataRef.current.scrollTop = chatDataRef.current.scrollHeight
    //     }
    // }, [thread])

    // useEffect(() => {
    //     preload()
    // }, [userClicked?.phone_number_id])

    useEffect(() => {
        if (userClicked?.phone_number_id) {
            preload(null, false) // Initial load
        }
    }, [userClicked])

    log('mediadata', mediaData)

    useEffect(() => {
        if (userClicked?.phone_number_id) {
            preload(null, false) // Initial load
        }
    }, [userClicked])

    // ** Scroll to chat bottom
    const scrollToBottom = (val = null) => {
        const chatContainer = chatArea.current?._container || chatArea.current
        if (chatContainer) {
            chatContainer.scrollTop = val ?? chatContainer.scrollHeight
        }
    }

    log('list the length', thread?.data[0]?.whats_app_send_sms?.whats_app_configuration_id)
    // ** If user chat is not empty scrollToBottom
    useEffect(() => {
        const selectedUserLen = userClicked?.phone_number_id

        if (selectedUserLen && scroll) {
            scrollToBottom()
        }
    }, [userClicked])

    // ** Formats chat data based on sender
    const formattedChatData = () => {
        let chatLog = []
        if (selectedUser.chat) {
            chatLog = selectedUser.chat.chat
        }

        const formattedChatLog = []
        let chatMessageSenderId = chatLog[0] ? chatLog[0].senderId : undefined
        let msgGroup = {
            senderId: chatMessageSenderId,
            messages: []
        }
        chatLog.forEach((msg, index) => {
            if (chatMessageSenderId === msg.senderId) {
                msgGroup.messages.push({
                    msg: msg.message,
                    time: msg.time
                })
            } else {
                chatMessageSenderId = msg.senderId
                formattedChatLog.push(msgGroup)
                msgGroup = {
                    senderId: msg.senderId,
                    messages: [
                        {
                            msg: msg.message,
                            time: msg.time
                        }
                    ]
                }
            }
            if (index === chatLog.length - 1) formattedChatLog.push(msgGroup)
        })
        return formattedChatLog
    }

    // const renderChats = () => {


    //     return thread?.data?.data?.map((item, index) => {
    //         return (
    //             <div
    //                 key={index}
    //                 className={classnames({
    //                     'chat-left': item.is_vendor_reply !== 1,
    //                     chat: item.is_vendor_reply === 1
    //                 })}
    //             >

    //                 <div className='chat-avatar'>
    //                     <Avatar
    //                         imgWidth={36}
    //                         imgHeight={36}
    //                         content={item.profile_name} initials
    //                         color='light-primary'

    //                         className='box-shadow-1 cursor-pointer'

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


    const renderChats = () => {
        return thread?.data?.data?.map((item, index) => {
            const urlRegex = /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif))/i
            const match = typeof item.message === 'string' && item.message.match(urlRegex)
            const imageUrl = match ? match[0] : null

            if (item.message_type === 'order') {
                return (
                    <div
                        key={index}
                        className={classnames({
                            'chat-left': item.is_vendor_reply !== 1,
                            chat: item.is_vendor_reply === 1
                        })}
                    >
                        <div className='chat-avatar'>
                            <Avatar
                                imgWidth={36}
                                imgHeight={36}
                                content={item.profile_name}
                                initials
                                color='light-primary'
                                className='box-shadow-1 cursor-pointer'
                            />
                        </div>
                        <div className='chat-body'>
                            <div className='chat-content'>
                                <p>
                                    <small className='fw-bold' style={{ color: 'darkgreen' }}>
                                        {item?.profile_name}
                                    </small>
                                </p>
                                <Button color='primary' onClick={() => handleOpenOrderModal(item.message)}>
                                    View Order
                                </Button>
                                <p>
                                    <small>{item?.received_date}</small>
                                </p>
                            </div>
                        </div>
                    </div>
                )
            } else if (item.message_type === 'interactive') {
                return (
                    <div
                        key={index}
                        className={classnames({
                            'chat-left': item.is_vendor_reply !== 1,
                            chat: item.is_vendor_reply === 1
                        })}
                    >
                        <div className='chat-avatar'>
                            <Avatar
                                imgWidth={36}
                                imgHeight={36}
                                content={item.profile_name}
                                initials
                                color='light-primary'
                                className='box-shadow-1 cursor-pointer'
                            />
                        </div>
                        <div className='chat-body'>
                            <div className='chat-content'>
                                <p>
                                    <small className='fw-bold' style={{ color: 'darkgreen' }}>
                                        {item?.profile_name}
                                    </small>
                                </p>
                                <p>
                                    {(() => {
                                        try {
                                            const parsed = JSON.parse(item.message)
                                            return parsed?.button_reply?.title || parsed?.list_reply?.title || item.message
                                        } catch (e) {
                                            return item.message
                                        }
                                    })()}
                                </p>
                                <p>
                                    <small>{item?.received_date}</small>
                                </p>
                            </div>
                        </div>
                    </div>
                )
            } else if (item.message_type === 'button') {
                return (
                    <div
                        key={index}
                        className={classnames({
                            'chat-left': item.is_vendor_reply !== 1,
                            chat: item.is_vendor_reply === 1
                        })}
                    >
                        <div className='chat-avatar'>
                            <Avatar
                                imgWidth={36}
                                imgHeight={36}
                                content={item.profile_name}
                                initials
                                color='light-primary'
                                className='box-shadow-1 cursor-pointer'
                            />
                        </div>
                        <div className='chat-body'>
                            <div className='chat-content'>
                                <p>
                                    <small className='fw-bold' style={{ color: 'darkgreen' }}>
                                        {item?.profile_name}
                                    </small>
                                </p>
                                <Button color='primary' onClick={() => handleOpenButtonModal(item.message)}>
                                    View Button Message
                                </Button>
                                <p>
                                    <small>{item?.received_date}</small>
                                </p>
                            </div>
                        </div>
                    </div>
                )
            } else if (item.message_type === 'contacts') {
                try {
                    const contacts = JSON.parse(item.message)
                    return (
                        <div
                            key={index}
                            className={classnames({
                                'chat-left': item.is_vendor_reply !== 1,
                                chat: item.is_vendor_reply === 1
                            })}
                        >
                            <div className='chat-avatar'>
                                <Avatar
                                    imgWidth={36}
                                    imgHeight={36}
                                    content={item.profile_name}
                                    initials
                                    color='light-primary'
                                    className='box-shadow-1 cursor-pointer'
                                />
                            </div>
                            <div className='chat-body'>
                                <div className='chat-content'>
                                    <p>
                                        <small className='fw-bold' style={{ color: 'darkgreen' }}>
                                            {item?.profile_name}
                                        </small>
                                    </p>
                                    {renderContactCard(contacts)}
                                    <p>
                                        <small>{item?.received_date}</small>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                } catch (error) {
                    console.error("Failed to parse contacts data:", error)
                    return null // Or some error display
                }
            } else if (item.message_type === 'location') {
                return (
                    <div
                        key={index}
                        className={classnames({
                            'chat-left': item.is_vendor_reply !== 1,
                            chat: item.is_vendor_reply === 1
                        })}
                    >
                        <div className='chat-avatar'>
                            <Avatar
                                imgWidth={36}
                                imgHeight={36}
                                content={item.profile_name}
                                initials
                                color='light-primary'
                                className='box-shadow-1 cursor-pointer'
                            />
                        </div>
                        <div className='chat-body'>
                            <div className='chat-content'>
                                <p>
                                    <small className='fw-bold' style={{ color: 'darkgreen' }}>
                                        {item?.profile_name}
                                    </small>
                                </p>
                                <Button color='primary' onClick={() => handleOpenLocationDisplayModal(item.message)}>
                                    View Location
                                </Button>
                                <p>
                                    <small>{item?.received_date}</small>
                                </p>
                            </div>
                        </div>
                    </div>
                )
            } else if (item.message_type === 'system') {
                try {
                    const systemMessage = JSON.parse(item.json_message)
                    return (
                        <div
                            key={index}
                            className={classnames({
                                'chat-left': item.is_vendor_reply !== 1,
                                chat: item.is_vendor_reply === 1
                            })}
                        >
                            <div className='chat-avatar'>
                                <Avatar
                                    imgWidth={36}
                                    imgHeight={36}
                                    content={item.profile_name}
                                    initials
                                    color='light-primary'
                                    className='box-shadow-1 cursor-pointer'
                                />
                            </div>
                            <div className='chat-body'>
                                <div className='chat-content'>
                                    <p>
                                        <small className='fw-bold' style={{ color: 'darkgreen' }}>
                                            {item?.profile_name}
                                        </small>
                                    </p>
                                    <p>{systemMessage.system.body}</p>
                                    <p>
                                        <small>{item?.received_date}</small>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                } catch (error) {
                    console.error("Failed to parse system message data:", error)
                    return null // Or some error display
                }
            } else if (item?.message_type === "unsupported") {
                return (
                    <div
                        key={index}
                        className={classnames({
                            'chat-left': item.is_vendor_reply !== 1,
                            chat: item.is_vendor_reply === 1
                        })}
                    >
                        <div className='chat-avatar'>
                            <Avatar
                                imgWidth={36}
                                imgHeight={36}
                                content={item.profile_name}
                                initials
                                color='light-primary'
                                className='box-shadow-1 cursor-pointer'
                            />
                        </div>
                        <div className='chat-body'>
                            <div className='chat-content'>
                                <p>
                                    <small className='fw-bold' style={{ color: 'darkgreen' }}>
                                        {item?.profile_name}
                                    </small>
                                </p>
                                {/* <Button color='primary' onClick={() => handleOpenOrderModal(item.message)}>
                                    View Order
                                </Button> */}
                                This message is not supported. You can check it on WhatsApp's mobile app.
                                <p>
                                    <small>{item?.received_date}</small>
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            return (
                <div
                    key={index}
                    className={classnames({
                        'chat-left': item.is_vendor_reply !== 1,
                        chat: item.is_vendor_reply === 1
                    })}
                >

                    <div className='chat-avatar'>
                        <Avatar
                            imgWidth={36}
                            imgHeight={36}
                            content={item.profile_name} initials
                            color='light-primary'

                            className='box-shadow-1 cursor-pointer'

                        />
                    </div>

                    <div className='chat-body'>
                        <div className='chat-content'>
                            <p>
                                <small className='fw-bold' style={{ color: 'darkgreen' }}>{item?.profile_name}</small>
                            </p>
                            {item.media_id !== null && item?.media_url === null ? (
                                renderMediaMessage(item, downloadTheFiles)
                            ) : item?.media_url?.includes(item?.media_id) && item?.mime_type?.includes('image') ? (
                                <>
                                    <img
                                        src={`${httpConfig.baseUrl2}/${item.media_url}`}
                                        alt="chat content"
                                        className='mb-1 cursor-pointer'
                                        style={{ width: '100%', height: '150px' }}
                                        onClick={() => handleOpenImageModal(`${httpConfig.baseUrl2}/${item.media_url}`)}
                                    />
                                    <br />
                                    <div
                                        className='ck-content'
                                        dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                                    />
                                </>
                            ) : item?.media_url?.includes(item?.media_id) && item?.mime_type?.includes('video') ? (
                                <video src={`${httpConfig.baseUrl2}${item.media_url}`} style={{ width: '100%', height: '150px' }} controls />
                            ) : typeof item.media_url === 'string' && item.media_url.includes('Received,') ? (
                                <div>
                                    <div className=''>
                                        <Dangerous sx={{ fontSize: '2rem', color: 'red', marginRight: '10px' }} />
                                        <p className='mb-0'>{item.media_url.split('Received,')[1]?.trim()}</p>
                                    </div>

                                    <div
                                        className='ck-content'
                                        dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                                    />
                                </div>

                                // <video src={`${httpConfig.baseUrl2}/${item.media_url}`} style={{ width: '100%', height: '150px' }} controls />
                            ) : item?.media_url?.includes(item?.media_id) && item?.mime_type?.includes('pdf') ? (
                                <div style={{ position: 'relative', display: 'inline-block', width: '150px', textAlign: 'center', cursor: 'pointer' }}>
                                    <a href={`${httpConfig.baseUrl2}/${item.media_url}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <PictureAsPdf fontSize='large' sx={{
                                            fontSize: '8rem',
                                            color: 'rgba(0, 0, 0, 0.1)'
                                        }} />
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)'
                                        }}>
                                            <Button color='primary'>View PDF</Button>
                                        </div>
                                    </a>
                                    <br />
                                    <span style={{ maxWidth: '150px', wordBreak: 'break-word', display: 'inline-block' }}>{item?.message}</span>
                                </div>
                            ) : item?.media_url?.includes(item?.media_id) && (item?.mime_type?.includes('document') || item?.mime_type?.includes('application')) ? (
                                <a href={`${httpConfig.baseUrl2}/${item.media_url}`} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center">
                                    <FileText size={40} className="me-1" />
                                    <span>{item?.message || 'Download Media'}</span>
                                </a>
                            ) : imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="chat content"
                                    className="cursor-pointer"
                                    style={{ width: '100%', height: '150px' }}
                                    onClick={() => handleOpenImageModal(imageUrl)}
                                />
                            ) : (
                                <div
                                    className='ck-content'
                                    dangerouslySetInnerHTML={{ __html: formatWhatsAppMessage(item?.message) }}
                                />
                            )}
                            <p>
                                <small>{item?.received_date}</small>
                            </p>
                        </div>
                    </div>
                </div>
            )
        })
    }

    const handleLoadMore = (e) => {
        if (
            isValid(userClicked?.user_id) && thread?.data?.current_page < thread?.data?.last_page && !loading && loadingPage !== thread?.data?.current_page + 1
        ) {
            if (e?.scrollTop <= 500) {
                log('lm', e.scrollTop)
                setScroll(false)
                setLoadingPage(thread?.data?.current_page + 1)
                if (isValid(userClicked?.phone_number_id)) {
                    waThreadMessageCaseWise({
                        loading: setLoading,
                        jsonData: {
                            conversation_id: userClicked?.id,
                phone_number: userClicked?.phone_number_id,
                            page: thread?.data?.current_page + 1,
                            per_page_record: thread?.data?.per_page
                        },
                        success: ((e: any) => {
                            const oold = thread?.data?.data
                            const neew = e?.data?.data
                            // unshift is used to add the new data to the top of the array
                            oold.unshift(...neew)
                            setThread({
                                ...e,
                                data: {
                                    ...e.data,
                                    data: oold
                                }
                            })
                            setLoadingPage(0)
                            // setThread(e)
                        }) as any
                    } as any)


                }
            }
        }
    }

    const onChange = e => {
        const reader = new FileReader(), files = e.target.files
        if (isValidArray(files)) {
            reader.onload = function () {
                setAvatar(String(reader.result ?? ''))
            }
            reader.readAsDataURL(files[0])
        }
    }

    const handleAvatarClick = obj => {
        handleUserSidebarRight()
        handleUser(obj)
    }

    const handleStartConversation = () => {
        if (!Object.keys(selectedUser).length && !userSidebarLeft && window.innerWidth < 992) {
            handleSidebar()
        }
    }

    // ** Sends New Msg
    const handleSendMsg = e => {
        e.preventDefault()

    }


    // receive new msg
    useEffect(() => {
        if (isValid(lastMessage) && (lastMessage?.command === CMD.wa_chatbot_update || lastMessage?.command === 'message')) {
            // log("lastmessages", lastMessage)
            if (!isValidArray(selectedUser?.chat?.chat)) {
                if (refreshContacts !== lastMessage?.id) {
                    log("a", lastMessage)
                    preload(null, false, false)
                    // dispatch(toggleRefreshContacts(lastMessage?.id))
                }
            }
            // fetchMessage(userProfile, lastMessage, dispatch, selectedUser?.chat?.chat, selectedUser?.contact)
        }
    }, [lastMessage, refreshContacts])

    // const ChatWrapper = Object.keys(selectedUser).length && selectedUser.chat ? PerfectScrollbar : 'div'
    const ChatWrapper = Object.keys(selectedUser).length && selectedUser.chat ? PerfectScrollbar : 'div'

    const checkFileType = (fileType) => {
        if (fileType === 1) {
            return "image"
        } else if (fileType === 2) {
            return "video"
        } else if (fileType === 3) {
            return "document"
        } else {
            return "text"

        }
    }

    // send message
    const sendMessage = (data) => {
        waSendMessage({
            jsonData: {
                ...data,
                conversation_id: userClicked?.id,
                message: mediaData && mediaData.length > 0 ? `${httpConfig.baseUrl2}${mediaData[0].toString()}` : userMessage,
                type: checkFileType(fileSelected),
                user_id: userLogin?.userType === 0 || userLogin?.userType === 3 ? userClicked?.user_id : userLogin?.id,
                whats_app_reply_thread_id: thread?.data?.data[0]?.id,
                // whats_app_configuration_id: thread?.data?.data[0]?.whats_app_send_sms?.whats_app_configuration_id
                display_phone_number: thread?.data?.data[0]?.display_phone_number,
                phone_number_id: thread?.data?.data[0]?.phone_number_id
            },
            success: ((e: any) => {
                navigate("/chat")
                preload()
                setMsg('')
                setFileSelected(0)
            }) as any,
            errors: ((e: any) => {
                const d = e?.data?.data
                for (const key in d) {
                    if (Object.hasOwnProperty.call(d, key)) {
                        if (isValidArray(d[key])) {
                            const message = d[key]?.map(a => `${a} \n`)
                            setError(key, { message, type: "validate" })
                        }
                    }
                }
            }) as any
        } as any)
    }


    return (
        <div className='chat-app-window'>
            <div className={classnames('start-chat-area', { 'd-none': userClicked?.phone_number_id })}>
                <div className='start-chat-icon mb-1'>
                    <MessageSquare />
                </div>
                <h4 className='sidebar-toggle start-chat-text' onClick={handleStartConversation}>
                    Start Conversation
                </h4>
            </div>

            <div className={classnames('active-chat', { 'd-none': selectedUser === null })}>
                <div className='chat-navbar'>
                    <header className='chat-header'>

                        <div className='d-flex align-items-center'>
                            <div className='sidebar-toggle d-block d-lg-none me-1' onClick={handleSidebar}>
                                <Menu size={21} />
                            </div>

                            <h6 className='mb-0'>{userClicked?.profile_name}, <span className='fw-bolder'>{userClicked?.phone_number_id}</span> </h6>
                        </div>
                        <div className='d-flex align-items-center'>
                            <ConversationTools conversationId={userClicked?.id} />
                        </div>
                    </header>
                </div>
                {/* <ChatWrapper ref={chatArea} onScrollUp={handleLoadMore} className='user-chats' options={{ wheelPropagation: false, wheelSpeed: 0.2, swipeEasing: true }}>
                    {selectedUser.chat ? <div className='chats'>{renderChats()}</div> : null}
                </ChatWrapper> */}
                {/* <ChatWrapper ref={chatArea} className='user-chats' options={{ wheelPropagation: false, wheelSpeed: 0.2, swipeEasing: true }}>
                    {selectedUser.chat ? <div className='chats'>{renderChats()}</div> : null}
                </ChatWrapper> */}

                {/* <ChatWrapper
                    ref={chatDataRef}
                    className='user-chats'
                    options={{ wheelPropagation: false, wheelSpeed: 0.2, swipeEasing: true }}
                >
                    {selectedUser?.chat ? <div className='chats'>{renderChats()}</div> : null}
                </ChatWrapper> */}

                <ChatWrapper ref={chatDataRef} className='user-chats'>
                    {loading ? (
                        <div className='chats'>
                            <div className='chat-left'>
                                <div className='chat-avatar'>
                                    <Shimmer style={{ width: 36, height: 36, borderRadius: '50%' }} />
                                </div>
                                <div className='chat-body'>
                                    <div className='chat-content' style={{ backgroundColor: 'transparent', boxShadow: 'none', padding: 0 }}>
                                        <Shimmer style={{ width: 150, height: 20, marginBottom: 5, borderRadius: 5 }} />
                                        <Shimmer style={{ width: 200, height: 40, borderRadius: 5 }} />
                                    </div>
                                </div>
                            </div>
                            <div className='chat'>
                                <div className='chat-avatar'>
                                    <Shimmer style={{ width: 36, height: 36, borderRadius: '50%' }} />
                                </div>
                                <div className='chat-body'>
                                    <div className='chat-content' style={{ backgroundColor: 'transparent', boxShadow: 'none', padding: 0 }}>
                                        <Shimmer style={{ width: 180, height: 20, marginBottom: 5, borderRadius: 5 }} />
                                        <Shimmer style={{ width: 220, height: 40, borderRadius: 5 }} />
                                    </div>
                                </div>
                            </div>
                            <div className='chat-left'>
                                <div className='chat-avatar'>
                                    <Shimmer style={{ width: 36, height: 36, borderRadius: '50%' }} />
                                </div>
                                <div className='chat-body'>
                                    <div className='chat-content' style={{ backgroundColor: 'transparent', boxShadow: 'none', padding: 0 }}>
                                        <Shimmer style={{ width: 160, height: 20, marginBottom: 5, borderRadius: 5 }} />
                                        <Shimmer style={{ width: 190, height: 40, borderRadius: 5 }} />
                                    </div>
                                </div>
                            </div>
                            <div className='chat'>
                                <div className='chat-avatar'>
                                    <Shimmer style={{ width: 36, height: 36, borderRadius: '50%' }} />
                                </div>
                                <div className='chat-body'>
                                    <div className='chat-content' style={{ backgroundColor: 'transparent', boxShadow: 'none', padding: 0 }}>
                                        <Shimmer style={{ width: 180, height: 20, marginBottom: 5, borderRadius: 5 }} />
                                        <Shimmer style={{ width: 220, height: 40, borderRadius: 5 }} />
                                    </div>
                                </div>
                            </div>
                            <div className='chat-left'>
                                <div className='chat-avatar'>
                                    <Shimmer style={{ width: 36, height: 36, borderRadius: '50%' }} />
                                </div>
                                <div className='chat-body'>
                                    <div className='chat-content' style={{ backgroundColor: 'transparent', boxShadow: 'none', padding: 0 }}>
                                        <Shimmer style={{ width: 150, height: 20, marginBottom: 5, borderRadius: 5 }} />
                                        <Shimmer style={{ width: 200, height: 40, borderRadius: 5 }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : selectedUser.chat ? <div className='chats'>{renderChats()}</div> : null}
                </ChatWrapper>

                <Form className='chat-app-form' onSubmit={handleSubmit(sendMessage)}>
                    {mediaData && (fileSelected === 1 || fileSelected === 2 || fileSelected === 3) && (
                        <div style={{ padding: '10px', position: 'relative' }}>
                            {fileSelected === 1 &&
                                <img
                                    src={`${httpConfig.baseUrl2}/${mediaData[0]}`}
                                    style={{ height: '55px', width: 'auto' }}
                                    alt='selected-img'
                                />
                            }
                            {fileSelected === 2 &&
                                <video
                                    src={`${httpConfig.baseUrl2}/${mediaData[0]}`}
                                    style={{ height: '55px', width: 'auto' }}
                                    controls
                                />
                            }
                            {fileSelected === 3 &&
                                <img
                                    src={"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/391px-PDF_file_icon.svg.png"}
                                    alt='document icon'
                                    style={{ height: '50px', width: 'auto' }}
                                />
                            }
                            <RippleButton
                                color='danger'
                                size='sm'
                                className='btn-icon'
                                style={{ position: 'absolute', top: '15px', right: '15px' }}
                                onClick={() => {
                                    setMediaData(null)
                                    setFileSelected(0)
                                }}
                            >
                                X
                            </RippleButton>
                        </div>
                    )}
                    <InputGroup className='input-group-merge me-1 form-send-message'>
                        {/* ${httpConfig.baseUrl2}${mediaData[0]?.toString()} */}

                        <Input
                            // value={msg}
                            name={'message'}
                            type='text'

                            // onChange={e => setMsg(e)}
                            onChange={e => setUserMessage(e.target.value)}
                            // onBlur = {e => setMsg(e)}
                            placeholder='Type your message'
                        />
                        <InputGroupText>
                            <Label className='attachment-icon mb-0' for='attach-doc'>
                                <UncontrolledButtonDropdown>
                                    <DropdownToggle color='flat-primary'>
                                        <Image className='cursor-pointer' size={14} />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => { toggleList(); setFileSelected(1) }} >
                                            Image
                                        </DropdownItem>
                                        <DropdownItem onClick={() => { toggleList(); setFileSelected(2) }}>
                                            Video
                                        </DropdownItem>
                                        <DropdownItem onClick={() => { toggleList(); setFileSelected(3) }}>
                                            Document
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                            </Label>
                        </InputGroupText>
                    </InputGroup>
                    <Button className='send' color='primary'>
                        <Send size={14} className='d-lg-none' />
                        <span className='d-none d-lg-block'>Send</span>
                    </Button>
                </Form>
            </div>

            <ListWhatsappComp fileType={fileSelected} setMediaData={setMediaData} toggleList={toggleList} list={list} getUserId={userClicked?.user_id} setList={setList} />

            <OrderDetailsModal
                isOpen={isOrderModalOpen}
                toggle={handleCloseOrderModal}
                orderData={selectedOrder}
            />

            <InteractiveMessageModal
                isOpen={isInteractiveModalOpen}
                toggle={handleCloseInteractiveModal}
                interactiveData={selectedInteractive}
            />

            <ButtonMessageModal
                open={isButtonModalOpen}
                handleModal={handleCloseButtonModal}
                messageData={selectedButtonMessage}
            />

            <LocationDisplayModal
                open={openLocationDisplayModal}
                toggle={handleCloseLocationDisplayModal}
                locationData={locationData}
            />

            <Modal isOpen={isImageModalOpen} toggle={handleCloseImageModal} size="lg" centered>
                <ModalHeader toggle={handleCloseImageModal}>View Image</ModalHeader>
                <ModalBody className="text-center">
                    {selectedImageSrc && (
                        <img
                            src={selectedImageSrc}
                            alt="Full View"
                            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                        />
                    )}
                </ModalBody>
            </Modal>
        </div>
    )
}

export default ChatLog
