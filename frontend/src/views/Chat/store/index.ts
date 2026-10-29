// ** Redux Imports
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

import { isValidArray } from '../../../utility/helpers/common'
import { changeConnectedUsersResponse, changeUserResponse, getChatResponse } from '../../../utility/Utils'

type ChatEntity = {
    id?: number | string
    chat?: {
        unseenMsgs?: number
        chat?: any[]
        [key: string]: any
    }
    [key: string]: any
}

type SelectedUserState = {
    chat: {
        chat: any[]
        [key: string]: any
    }
    contact: {
        [key: string]: any
    }
}

export interface AppChatState {
    perPage: number
    totalUnreadMessages: number
    minusDays?: number
    connectedUsers: any[]
    loading: boolean
    refreshContacts: boolean | number
    chats: ChatEntity[]
    contacts: ChatEntity[]
    userProfile: Record<string, any>
    selectedUser: SelectedUserState
}

const initialState: AppChatState = {
    perPage: 6,
    totalUnreadMessages: 0,
    minusDays: 0,
    connectedUsers: [],
    loading: false,
    refreshContacts: false,
    chats: [],
    contacts: [],
    userProfile: {},
    selectedUser: {
        chat: {
            chat: []
        },
        contact: {}
    }
}

export const getUserProfile = createAsyncThunk<Record<string, any>>('appChat/getTasks', async () => {
    const response = await axios.get('/apps/chat/users/profile-user')
    return response.data
})

export const sendMsg = createAsyncThunk<null, any>('appChat/sendMsg', async () => {
    return null
})

export const appChatSlice = createSlice({
    name: 'appChat',
    initialState,
    reducers: {
        toggleRefreshContacts: (state, action: PayloadAction<boolean | number>) => {
            state.refreshContacts = action.payload
        },
        setConnected: (state, action: PayloadAction<any>) => {
            state.connectedUsers = changeConnectedUsersResponse(action.payload)
        },
        setContacts: (state, action: PayloadAction<any>) => {
            const chats = changeUserResponse([], action.payload?.users, action?.payload?.user, action?.payload?.add)
            state.contacts = chats.contacts

            if (isValidArray(chats.chatsContacts)) {
                state.chats.unshift(chats.chatsContacts)
            }
        },
        setChats: (state, action: PayloadAction<any>) => {
            const chats = changeUserResponse(action.payload?.users, [], action?.payload?.user, action?.payload?.add)
            state.chats = chats.chatsContacts
            state.totalUnreadMessages = chats.unread_messages_count
        },
        selectChat: (state, action: PayloadAction<any>) => {
            state.selectedUser = getChatResponse(action?.payload, state?.selectedUser?.chat?.chat)
            state.totalUnreadMessages = 0
        },
        updateContact: (state, action: PayloadAction<any>) => {
            const index = state.contacts.findIndex(item => item.id === action.payload.id)
            if (index > -1) {
                const currentUnseen = Number(state.contacts[index]?.chat?.unseenMsgs ?? 0)
                const nextUnseen = action?.payload?.type === 'i' ? currentUnseen + 1 : 0

                state.contacts[index] = {
                    ...state.contacts[index],
                    chat: {
                        ...state.contacts[index]?.chat,
                        unseenMsgs: nextUnseen
                    }
                }
                state.totalUnreadMessages += nextUnseen
            }
        },
        updateChat: (state, action: PayloadAction<any>) => {
            const index = state.chats.findIndex(item => item.id === action.payload.id)
            if (index > -1) {
                const currentUnseen = Number(state.chats[index]?.chat?.unseenMsgs ?? 0)
                const nextUnseen = action?.payload?.type === 'i' ? currentUnseen + 1 : 0

                state.chats[index] = {
                    ...state.chats[index],
                    chat: {
                        ...state.chats[index]?.chat,
                        unseenMsgs: nextUnseen
                    }
                }
                state.totalUnreadMessages += nextUnseen
            }
        },
        sendMessageSelected: (state, action: PayloadAction<any>) => {
            state.selectedUser.chat.chat.push(action?.payload)
        },
        updateMessageSelected: (state, action: PayloadAction<any>) => {
            const index = state.selectedUser.chat.chat.findIndex(item => item.id === action.payload.id)
            if (index > -1) {
                state.selectedUser.chat.chat[index] = action?.payload
            }
        },
        deleteMessageSelected: (state, action: PayloadAction<any>) => {
            const index = state.selectedUser.chat.chat.findIndex(item => item.id === action.payload.id)
            if (index > -1) {
                state.selectedUser.chat.chat.splice(index, 1)
            }
        },
        receiveMessageSelected: (state, action: PayloadAction<any>) => {
            state.selectedUser.chat.chat.push(action?.payload)
        }
    }
})

export const {
    sendMessageSelected,
    receiveMessageSelected,
    updateMessageSelected,
    deleteMessageSelected,
    setContacts,
    setChats,
    selectChat,
    updateContact,
    updateChat,
    setConnected,
    toggleRefreshContacts
} = appChatSlice.actions

export default appChatSlice.reducer
