// ** React Imports
import '@styles/base/pages/app-chat-list.scss'
import '@styles/base/pages/app-chat.scss'
// ** Third Party Components
import classnames from 'classnames'
import { Fragment, useEffect, useState } from 'react'
// ** Store & Actions
import { useLocation } from 'react-router-dom'
import { ReadyState } from 'react-use-websocket'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { useRedux } from '../../redux/useRedux'
import { CMD } from '../../utility/Const'
import { isValidArray, log } from '../../utility/helpers/common'
import useWebSockets from '../../utility/hooks/useSocket'
// import useTopMostParent from '../../utility/hooks/useTopMostParent'
import useUser from '../../utility/hooks/useUser'
// ** Chat App Component Imports
import Chat from './Chat'
import Sidebar from './SidebarLeft'
import { getUserProfile, setChats, setContacts } from './store'
import UserProfileSidebar from './UserProfileSidebar'

const AppChat = () => {
    // ** Store Vars
    const dispatch = useAppDispatch()
    const store = useAppSelector(state => state.chat)
    const userData = useUser()
    const { reduxStates: { chat: { contacts, chats, minusDays } } } = useRedux()
    const topMostParent: { id?: number | string } | null = null
    // ** States
    const [user, setUser] = useState<Record<string, any>>({})
    const [sidebar, setSidebar] = useState(false)
    const [userSidebarRight, setUserSidebarRight] = useState(false)
    const [userSidebarLeft, setUserSidebarLeft] = useState(false)
    const { sendMessage, readyState, lastMessage } = useWebSockets()
    const { state } = useLocation()

    // ** Sidebar & overlay toggle functions
    const handleSidebar = () => setSidebar(!sidebar)
    const handleUserSidebarLeft = () => setUserSidebarLeft(!userSidebarLeft)
    const handleUserSidebarRight = () => setUserSidebarRight(!userSidebarRight)
    const handleOverlayClick = () => {
        setSidebar(false)
        setUserSidebarRight(false)
        setUserSidebarLeft(false)
    }

    // ** Set user function for Right Sidebar
    const handleUser = (obj: Record<string, any>) => setUser(obj)

    // ** Get data on Mount
    useEffect(() => {
        // dispatch(getChatContacts())
        dispatch(getUserProfile())
    }, [dispatch])

    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            // dispatch(getChatContacts())
            if (userData?.id && topMostParent?.id) {
                if (!isValidArray(contacts)) {
                    sendMessage({
                        command: CMD.getContacts,
                        top_most_parent_id: topMostParent?.id,
                        userId: userData?.id
                    })
                }
                if (!isValidArray(chats)) {
                    sendMessage({
                        command: CMD.getChats,
                        top_most_parent_id: topMostParent?.id,
                        userId: userData?.id
                    })
                }
            }
        }
    }, [readyState, ReadyState, userData, topMostParent])

    const getContacts = (lastMessage: any) => {
        if (lastMessage?.command === CMD.getContacts) {
            if (!isValidArray(contacts)) {
                if (isValidArray(lastMessage?.data)) {
                    dispatch(setContacts(lastMessage.data))
                }
            }
        }
    }

    const getChats = (lastMessage: any) => {
        if (lastMessage?.command === CMD.getChats) {
            if (!isValidArray(chats)) {
                if (isValidArray(lastMessage.data)) {
                    dispatch(setChats(lastMessage.data))
                }
            }
        }
    }
    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            getContacts(lastMessage)
            getChats(lastMessage)
        }
    }, [lastMessage, readyState])

    return (
        <Fragment>
            <Sidebar
                location={state}
                store={store}
                sidebar={sidebar}
                handleSidebar={handleSidebar}
                userSidebarLeft={userSidebarLeft}
            // handleUserSidebarLeft={handleUserSidebarLeft}
            />
            <div className='content-right'>
                <div className='content-wrapper'>
                    <div className='content-body'>
                        <div
                            className={classnames('body-content-overlay', {
                                show: userSidebarRight === true || sidebar === true || userSidebarLeft === true
                            })}
                            onClick={handleOverlayClick}
                        ></div>
                        <Chat
                            store={store}
                            handleSidebar={handleSidebar}
                            userSidebarLeft={userSidebarLeft}
                            handleUserSidebarRight={handleUserSidebarRight}
                        />
                        <UserProfileSidebar
                            user={user}
                            userSidebarRight={userSidebarRight}
                            handleUserSidebarRight={handleUserSidebarRight}
                        />
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default AppChat
