// ** React Imports
import { createContext, ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { MessageSquare } from 'react-feather'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { useAppSelector } from '../../redux/hooks'
import { useRedux } from '../../redux/useRedux'
import { setChats, setContacts, updateChat, updateContact } from '../../views/Chat/store'
import { CMD, Events } from '../Const'
import Emitter from '../Emitter'
import { isValid, isValidArray } from '../helpers/common'
import useUser from '../hooks/useUser'
import httpConfig from '../http/httpConfig'
import { changeConnectedUsersResponse, JsonParseValidate, MessageToast, truncateText } from '../Utils'

type SocketPayload = Record<string, any>

type SocketProviderValue = {
    sendJsonMessage: (payload: SocketPayload) => void
    lastMessage: any
    readyState: number | null
    disconnect: () => void
}

type SocketContextProps = {
    children: ReactNode
}

type IncomingSocketMessage = {
    command?: string
    data?: any
    from?: number | string
    message?: string
}

type ShowMessageProps = {
    user: any
    message: string
}

const noop = () => undefined

// ** Create Context
const Socket = createContext<SocketProviderValue>({
    sendJsonMessage: noop,
    lastMessage: null,
    readyState: null,
    disconnect: noop
})

document.addEventListener('DOMContentLoaded', () => {
    if (!('Notification' in window)) {
        alert('Desktop notifications not available in your browser. Try Chromium.')
        return
    }

    if (Notification.permission !== 'granted') Notification.requestPermission()
})

const MySwal = withReactContent(Swal)

const popup = (title: string, text: string, icon: any, confirmButtonText: string) => {
    return MySwal.fire({
        title,
        text,
        icon,
        confirmButtonText,
        allowOutsideClick: false,
        customClass: {
            input: 'form-control mx-3',
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-danger ms-1',
            denyButton: 'btn btn-warning ms-1'
        },
        inputAttributes: {
            autocapitalize: 'off'
        },
        buttonsStyling: false
    })
}

const SocketContext = ({ children }: SocketContextProps) => {
    const user = useUser()
    const token = useAppSelector(state => state.auth?.access_token ?? null)
    const {
        reduxStates: {
            chat: { contacts, chats, selectedUser, refreshContacts }
        },
        dispatch
    } = useRedux()

    const [url, setUrl] = useState<string | null>(null)
    const reconnect = useRef(false)
    const [count, setCount] = useState(0)
    const [registered, setRegistered] = useState(false)

    const { sendJsonMessage: rawSendJsonMessage, lastMessage, readyState, getWebSocket } = useWebSocket(url, {
        shouldReconnect: () => reconnect.current,
        reconnectAttempts: 5,
        reconnectInterval: 3000
    }, httpConfig?.enableSocket)

    const sendJsonMessage = rawSendJsonMessage as (payload: SocketPayload) => void

    const registerChat = useCallback(() => {
        sendJsonMessage({
            command: 'register',
            userId: user?.id,
            token
        })
    }, [sendJsonMessage, token, user?.id])

    const disconnect = useCallback(() => {
        sendJsonMessage({
            command: 'disconnect',
            userId: user?.id,
            token
        })
        setRegistered(false)
        getWebSocket()?.close()
    }, [getWebSocket, sendJsonMessage, token, user?.id])

    useEffect(() => {
        if (isValid(token)) {
            setUrl(httpConfig.socketChatUrl)
            if (readyState === ReadyState.CLOSED && count < 5) {
                reconnect.current = true
                setCount(prev => prev + 1)
            } else if (count === 5) {
                setRegistered(false)
                getWebSocket()?.close()
            }
        } else {
            setUrl('')
            reconnect.current = false
        }
    }, [count, getWebSocket, readyState, token])

    const sendMessage = useCallback((params: SocketPayload) => {
        sendJsonMessage({
            ...params,
            token
        })
    }, [sendJsonMessage, token])

    const loadContacts = useCallback((from: string | null = null) => {
        if (user?.id) {
            sendMessage({
                command: CMD.getContacts,
                userId: user?.id,
                executedFrom: from
            })
            sendMessage({
                command: CMD.getChats,
                userId: user?.id,
                executedFrom: from
            })
        }
    }, [sendMessage, user?.id])

    useEffect(() => {
        if (readyState === ReadyState.OPEN && registered) {
            loadContacts('page-load')
        }
    }, [loadContacts, readyState, registered])

    const getContacts = (message: IncomingSocketMessage) => {
        if (message?.command === CMD.getContacts && isValidArray(message?.data)) {
            dispatch(setContacts({ user, users: message.data }))
        }
    }

    useEffect(() => {
        if (refreshContacts !== false) {
            loadContacts('refresh-contact')
        }
    }, [loadContacts, refreshContacts])

    const getChats = (message: IncomingSocketMessage) => {
        if (message?.command === CMD.getChats) {
            const data = Array.isArray(message.data) ? message.data : Object.entries(message?.data ?? {})?.map(row => row[1])
            if (isValidArray(data)) {
                dispatch(setChats({ users: data, user }))
            }
        }
    }

    const isValidConnected = (data: any) => {
        const connectedUsers = changeConnectedUsersResponse(data)
        return isValidArray(connectedUsers)
    }

    const getConnected = (message: IncomingSocketMessage) => {
        if (message?.command === CMD.connectedUsers && isValidConnected(message?.data)) {
            // dispatch(setConnected(message.data))
        }
    }

    const ShowMessage = ({ user: currentUser, message }: ShowMessageProps) => {
        return (
            <div className='d-flex align-items-center' onClick={() => Emitter.emit(Events.RedirectMessage, { user: currentUser, message })}>
                <span className='pe-1'>
                    <MessageSquare className='text-primary' size={26} />
                </span>
                <span>
                    <p className='text-small-12 mb-3px text-muted'>{currentUser?.fullName}</p>
                    <p className='mb-0 text-small-12 text-dark'>{truncateText(message, 100)}</p>
                </span>
            </div>
        )
    }

    const setRecentMessage = (message: IncomingSocketMessage) => {
        if (message?.command === CMD.message) {
            const allUsers = chats.concat(contacts)
            const chat = chats?.find(item => item?.id === message?.from)
            const contact = contacts?.find(item => item?.id === message?.from)
            const userFound = allUsers?.find(item => item?.id === message?.from)

            if (selectedUser?.contact?.id !== message?.from && message?.from !== user?.id) {
                if (isValid(contact)) dispatch(updateContact({ ...contact, type: 'i' }))
                if (isValid(chat)) dispatch(updateChat({ ...chat, type: 'i' }))
            }

            if (!isValid(selectedUser?.contact?.id) && message?.from !== user?.id) {
                MessageToast(<ShowMessage user={userFound} message={message?.message ?? ''} />)
            }
        }
    }

    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            const parsedMessage = JsonParseValidate(lastMessage?.data)
            getContacts(parsedMessage)
            getChats(parsedMessage)
            setRecentMessage(parsedMessage)
            getConnected(parsedMessage)
        }
    }, [lastMessage, readyState])

    // Init websocket and register user.
    useEffect(() => {
        if (readyState === ReadyState.OPEN && isValid(token)) {
            setRegistered(true)
            registerChat()
        }
    }, [readyState, registerChat, token])

    return <Socket.Provider value={{ lastMessage, sendJsonMessage, readyState, disconnect }}>{children}</Socket.Provider>
}

export { Socket, SocketContext, popup }
