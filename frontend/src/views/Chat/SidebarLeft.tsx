// ** React Imports
// ** Custom Components
import AvatarBase from '@components/avatar'
// ** Utils
import { formatDate, formatDateToMonthShort, isObjEmpty } from '../../utility/Utils'
// ** Third Party Components
import classnames from 'classnames'
import { useEffect, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Filter, Search, X } from 'react-feather'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useDispatch } from 'react-redux'
import { ReadyState } from 'react-use-websocket'
// ** Reactstrap Imports
import { Badge, CardText, Input, InputGroup, InputGroupText } from 'reactstrap'
import { CMD } from '../../utility/Const'
import { isValid, isValidArray, log } from '../../utility/helpers/common'
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
    const [showFilters, setShowFilters] = useState(false)
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
        const contactsToRender = query.length ? filteredContacts : loadUser?.data
        if (isValidArray(contactsToRender) && contactsToRender.length === 0) {
            return (
                <li className='no-results p-2 text-center text-muted'>
                    <small>No conversations found</small>
                </li>
            )
        }
        return contactsToRender?.map((item: any, index: number) => {
            const isActive = active === item.id
            const profileName = item.profile_name || item.phone_number_id || 'WhatsApp User'
            return (
                <li
                    key={item.id || index}
                    onClick={() => handleAvatarClick(item, item)}
                    className={classnames({ 'active-contact': isActive, 'active-chat-item': isActive })}
                >
                    <Avatar
                        content={profileName}
                        initials
                        color={isActive ? 'light-success' : 'light-primary'}
                        style={{
                            width: 38,
                            height: 38,
                            minWidth: 38
                        }}
                    />
                    <div className='chat-info flex-grow-1 ms-1'>
                        <h5 className='mb-0 d-flex justify-content-between align-items-center'>
                            <span className='text-truncate' style={{ maxWidth: '170px' }}>{profileName}</span>
                            {item.unread_count > 0 && (
                                <Badge color='success' pill className='unread-pill'>
                                    {item.unread_count}
                                </Badge>
                            )}
                        </h5>
                        <div className='chat-message-preview d-flex justify-content-between align-items-center'>
                            <span className='preview-text text-truncate text-muted'>
                                {item?.message || 'Media / Template message'}
                            </span>
                            {item.business_phone_number_id && (
                                <span className='badge bg-light text-secondary ms-1' style={{ fontSize: '0.65rem' }}>
                                    WA
                                </span>
                            )}
                        </div>
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
                                    {query ? (
                                        <InputGroupText className='round cursor-pointer' onClick={() => { setQuery(''); setFilteredContacts([]) }}>
                                            <X className='text-muted' size={14} />
                                        </InputGroupText>
                                    ) : null}
                                </InputGroup>
                            </div>
                        </div>
                        <PerfectScrollbar className='chat-user-list-wrapper list-group' options={{ wheelPropagation: false }}>
                            <div className='chat-filter-toolbar'>
                                <div className='filter-pills-row'>
                                    <button
                                        type='button'
                                        className={classnames('filter-pill-btn', {
                                            active: assignment === 'all' && !unread && !inboxState && !label
                                        })}
                                        onClick={() => {
                                            setAssignment('all')
                                            setUnread(false)
                                            setInboxState('')
                                            setLabel('')
                                        }}
                                    >
                                        All
                                    </button>
                                    <button
                                        type='button'
                                        className={classnames('filter-pill-btn', { active: unread })}
                                        onClick={() => setUnread(!unread)}
                                    >
                                        Unread
                                    </button>
                                    <button
                                        type='button'
                                        className={classnames('filter-pill-btn', { active: assignment === 'mine' })}
                                        onClick={() => setAssignment(assignment === 'mine' ? 'all' : 'mine')}
                                    >
                                        Assigned
                                    </button>
                                    <button
                                        type='button'
                                        className={classnames('filter-pill-btn', { active: inboxState === 'open' })}
                                        onClick={() => setInboxState(inboxState === 'open' ? '' : 'open')}
                                    >
                                        Open
                                    </button>
                                    <button
                                        type='button'
                                        className={classnames('filter-pill-btn', { active: inboxState === 'closed' })}
                                        onClick={() => setInboxState(inboxState === 'closed' ? '' : 'closed')}
                                    >
                                        Closed
                                    </button>
                                </div>
                                <div
                                    className='filter-advanced-toggle'
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter size={12} />
                                    <span>{showFilters ? 'Hide filters' : 'More filters'}</span>
                                    {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </div>
                                {showFilters && (
                                    <div className='filter-advanced-drawer'>
                                        <Input
                                            aria-label='Filter by label'
                                            placeholder='Filter by label...'
                                            value={label}
                                            onChange={e => setLabel(e.target.value)}
                                        />
                                        <Input
                                            aria-label='Conversation assignment'
                                            type='select'
                                            value={assignment}
                                            onChange={e => setAssignment(e.target.value)}
                                        >
                                            <option value='all'>All assignments</option>
                                            <option value='mine'>Assigned to me</option>
                                            <option value='unassigned'>Unassigned</option>
                                        </Input>
                                    </div>
                                )}
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
