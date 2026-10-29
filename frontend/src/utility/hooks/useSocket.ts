import { useCallback, useContext, useMemo } from 'react'

import { Socket } from '../context/Socket'
import { JsonParseValidate } from '../Utils'
import useUser from './useUser'

type SendMessageParams = {
    [key: string]: any
}

type SendMessageToUserParams = {
    to?: number | string | null
    message?: string
    file_path?: string | null
    file_type?: string | null
}

const useWebSockets = () => {
    const user = useUser()
    const token = JSON.parse(localStorage.getItem('access_token') ?? 'null')
    const { sendJsonMessage: rawSendJsonMessage, lastMessage, readyState } = useContext(Socket)
    const sendJsonMessage = rawSendJsonMessage as (payload: any) => void

    const parsedLastMessage = useMemo(() => {
        return JsonParseValidate(lastMessage?.data)
    }, [lastMessage?.data])

    const sendMessageToUser = useCallback(({ to = null, message = '', file_path = null, file_type = null }: SendMessageToUserParams) => {
        sendJsonMessage({
            command: 'message',
            token,
            to,
            from: user?.id,
            message,
            file_path,
            file_type
        })
    }, [sendJsonMessage, token, user?.id])

    const sendMessage = useCallback((params: SendMessageParams) => {
        sendJsonMessage({
            ...params,
            token
        })
    }, [sendJsonMessage, token])

    return {
        readyState,
        lastMessage: parsedLastMessage,
        sendMessage,
        sendMessageToUser
    }
}

export default useWebSockets
