// ** React Imports
// ** Custom Components
import AvatarBase from '@components/avatar'
// ** Utils
import { formatDate, formatDateToMonthShort, isObjEmpty } from '../../utility/Utils'
// ** Third Party Components
import classnames from 'classnames'
import { useEffect, useState } from 'react'
import { Search, X } from 'react-feather'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useDispatch } from 'react-redux'
import { ReadyState } from 'react-use-websocket'
// ** Reactstrap Imports
import { Badge, CardText, Input, InputGroup, InputGroupText } from 'reactstrap'
import { CMD } from '../../utility/Const'
import { isValid, log } from '../../utility/helpers/common'
import Hide from '../../utility/Hide'
import useWebSockets from '../../utility/hooks/useSocket'
import useUser from '../../utility/hooks/useUser'
import Show from '../../utility/Show'
import Shimmer from '../components/shimmers/Shimmer'
import { waThreadMessage } from '../../utility/apis/whatsappConversation'
import Chat from './Chat'
// ** Store & Actions
import { selectChat, updateChat, updateContact } from './store'
import { userClickedLoad } from '../../redux/reducers/loadUserClick'

const Avatar = AvatarBase as any

const SidebarLeft = props => {
    // ** Props & Store
    const { store, location, sidebar, handleSidebar, userSidebarLeft, handleUserSidebarLeft } = props
    const { chats, contacts, selectedUser, connectedUsers, perPage } = store
    const userProfile = useUser()

    // ** Dispatch
    const dispatch = useDispatch()

    // ** State
    const [query, setQuery] = useState('')
    const [inboxState, setInboxState] = useState(''), [assignment, setAssignment] = useState('all'), [unread, setUnread] = useState(false), [label, setLabel] = useState('')
    const [active, setActive] = useState(null)
    const [filteredContacts, setFilteredContacts] = useState([])
    const [loadUser, setLoadUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState(null)

    const { sendMessage, readyState, lastMessage } = useWebSockets()

    const today = formatDate(new Date(), "YYYY-MM-DD")

    const loadUserList = () => {
        waThreadMessage({
            jsonData: { search: query, ...(inboxState ? { state: inboxState } : {}), assignment, unread: String(unread), ...(label ? { label } : {}) },
            loading: setLoading,
            success: ((e: any) => {
                setLoadUser(e)
            }) as any
        } as any)
    }

    useEffect(() => {
        const timer = setTimeout(loadUserList, 300)
        return () => clearTimeout(timer)
    }, [query, inboxState, assignment, unread, label])

    // receive new msg
    useEffect(() => {
        if (isValid(lastMessage) && (lastMessage?.command === CMD.wa_chatbot_update || lastMessage?.command === 'message')) {
            loadUserList()
        }
    }, [lastMessage])

    const handleAvatarClick = (userName, item) => {
        setUserData(userName)
        dispatch(userClickedLoad(userName))
        setActive(item?.id)
        console.log('active:', item?.id)
    }

    console.log("contacts", contacts)


    // const renderAllContacts = () => {
    //     const contactsToRender = query.length ? filteredContacts : loadUser?.data
    //     return contactsToRender?.map((item, index) => {
    //         return (
    //             <li key={index} onClick={() => handleAvatarClick(item)}>
    //                 <Avatar
    //                     imgHeight='42'
    //                     imgWidth='42'
    //                 />
    //                 <div className='chat-info flex-grow-1'>
    //                     <h5 className='mb-0'>{item.profile_name}</h5>
    //                     <CardText className='text-truncate'>
    //                         {item?.message}
    //                     </CardText>
    //                 </div>
    //             </li>
    //         )
    //     })
    // }

    const handleUserClick = (id, userName) => {
        setUserData(userName)
        dispatch(userClickedLoad(userName))
        dispatch(updateChat(id))
        dispatch(updateContact(id))
        if (isValid(userProfile?.id)) {
            sendMessage({
                command: CMD.readMessages,
                other_user_id: id?.id,
                logged_in_user_id: userProfile?.id
            })
            sendMessage({
                command: CMD.getMessages,
                other_user_id: id?.id,
                logged_in_user_id: userProfile?.id,
                per_page: perPage,
                page: 1,
                from_date: null,
                end_date: null
            })
        }
        setActive(id)
        if (sidebar === true) {
            handleSidebar()
        }
    }

    // const renderAllContacts = () => {
    //     const contactsToRender = query.length ? filteredContacts : loadUser?.data
    //     return contactsToRender?.map((item, index) => {
    //         const isActive = active && active.id === item.id
    //         return (
    //             <li
    //                 key={index}
    //                 onClick={() => handleAvatarClick(item)}
    //                 className={classnames({ 'active-contact': isActive })}
    //             >
    //                 <Avatar
    //                     // imgHeight='42'
    //                     // imgWidth='42'
    //                     content={item.profile_name} initials
    //                     color='light-primary'
    //                     // className='text-center'
    //                      style={{ width: 35, height: 35 }}
    //                 />
    //                 <div className='chat-info flex-grow-1'>
    //                     <h5 className='mb-0'>{item.profile_name}</h5>
    //                     <CardText className='text-truncate'>
    //                         {item?.message}
    //                     </CardText>
    //                 </div>
    //             </li>
    //         )
    //     })
    // }

    const renderAllContacts = () => {
        const contactsToRender = loadUser?.data
        return contactsToRender?.map((item, index) => {
            // const isActive = active && active.id === item.id
            const isActive = active === item.id
            return (
                // <li
                //     key={index}
                //     onClick={() => handleAvatarClick(item, item)}

                //     style={active === item.id ? { backgroundColor: 'orange', textColor: 'white' } : {}}
                // >
                //     <Avatar
                //         // imgHeight='42'
                //         // imgWidth='42'
                //         content={item.profile_name} initials
                //         color='light-primary'
                //         // className='text-center'
                //         style={{ width: 35, height: 35 }}
                //     />
                //     <div className='chat-info flex-grow-1'>
                //         <h5 className='mb-0'>{item.profile_name}</h5>
                //         <CardText className='text-truncate'>
                //             {item?.message}
                //         </CardText>
                //     </div>
                // </li>
                <li
                    key={index}
                    onClick={() => handleAvatarClick(item, item)}
                    style={active === item.id ? { backgroundColor: '#ff9b36' } : {}}
                >
                    <Avatar
                        content={item.profile_name ? item.profile_name : item.phone_number_id}
                        initials
                        color={active === item.id ? 'text-white' : 'light-primary'}


                        style={{
                            width: 35,
                            height: 35

                            // color: active === item.id ? 'white' : 'light-primary',
                            // backgroundColor: active === item.id ? 'orange' : undefined

                        }}
                    />
                    <div className='chat-info flex-grow-1'>
                        <h5 className='mb-0' style={{ color: active === item.id ? 'white' : undefined }}>
                            {item.profile_name ? item.profile_name : item.phone_number_id}
                            {item.unread_count > 0 && <Badge color='primary' className='ms-1'>{item.unread_count}</Badge>}
                        </h5>
                        <CardText className='text-truncate' style={{ color: active === item.id ? 'white' : undefined }}>
                            {item?.message}
                            {item.business_phone_number_id && <small>Business number ID: {item.business_phone_number_id}</small>}
                        </CardText>
                    </div>
                </li>
            )
        })
    }

    useEffect(() => {
        if (!isObjEmpty(store.selectedUser)) {
            if (store.selectedUser.chat) {
                setActive(store.selectedUser.chat)
            } else {
                setActive(store.selectedUser.contact)
            }
        }
    }, [])

    useEffect(() => {
        if (isValid(location?.user)) {
            handleUserClick(location?.user, location?.user)
        }
    }, [location, userProfile])

    const handleFilter = e => {
        const query = e.target.value.toLowerCase()
        setQuery(query)
        if (loadUser?.data) {
            const filteredContacts = loadUser.data.filter(
                contact => contact?.profile_name && contact?.profile_name?.toLowerCase().includes(query)
            )
            setFilteredContacts(filteredContacts)
        }
    }

    return store ? (
        <>
            <div className='sidebar-left'>
                <div className='sidebar'>
                    <div
                        className={classnames('sidebar-content', {
                            show: sidebar === true
                        })}
                    >
                        <div className='sidebar-close-icon' onClick={handleSidebar}>
                            <X size={14} />
                        </div>
                        <div className='chat-fixed-search'>
                            <div className='d-flex align-items-center w-100'>
                                <div className='sidebar-profile-toggle' onClick={handleUserSidebarLeft}>
                                    {Object.keys(userProfile ?? {}).length ? (
                                        <Avatar
                                            className='avatar-border'
                                            img={userProfile.avatar}
                                            imgHeight='42'
                                            imgWidth='42'
                                            content={userProfile.name} initials
                                            color='light-primary'
                                        />
                                    ) : null}
                                </div>
                                <InputGroup className='input-group-merge ms-1 w-100'>
                                    <InputGroupText className='round'>
                                        <Search className='text-muted' size={14} />
                                    </InputGroupText>
                                    <Input
                                        value={query}
                                        className='round'
                                        placeholder='Search or start a new chat'
                                        onChange={handleFilter}
                                    />
                                </InputGroup>
                            </div>
                        </div>
                        <PerfectScrollbar className='chat-user-list-wrapper list-group' options={{ wheelPropagation: false }}>
                            <div className='p-1'>
                                <Input aria-label='Conversation status' type='select' value={inboxState} onChange={e => setInboxState(e.target.value)}><option value=''>All statuses</option><option value='open'>Open</option><option value='closed'>Closed</option></Input>
                                <Input aria-label='Conversation assignment' type='select' className='mt-1' value={assignment} onChange={e => setAssignment(e.target.value)}><option value='all'>All assignments</option><option value='mine'>Assigned to me</option><option value='unassigned'>Unassigned</option></Input>
                                <Input aria-label='Filter by label' placeholder='Filter by label' className='mt-1' value={label} onChange={e => setLabel(e.target.value)} />
                                <label className='mt-1'><input type='checkbox' checked={unread} onChange={e => setUnread(e.target.checked)} /> Unread only</label>
                            </div>
                            <h4 className='chat-list-title'>Chats</h4>
                            <ul className='chat-users-list contact-list media-list' key={`contact-${query}`}>
                                <Show IF={loading && !contacts.length}>
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                    <Shimmer style={{
                                        width: "100%",
                                        height: 65,
                                        marginBottom: 2
                                    }} />
                                </Show>
                                {renderAllContacts()}
                            </ul>
                        </PerfectScrollbar>
                    </div>
                </div>
            </div>
        </>
    ) : null
}

export default SidebarLeft
