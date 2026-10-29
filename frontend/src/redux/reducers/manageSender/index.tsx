// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const senderIdSlice = createSlice({
    name: 'senderId',
    initialState: {
        senderId: {
            data: []
        }
    },
    reducers: {
        senderIdLoad: (state, action) => {
            state.senderId = action?.payload
        },
        senderIdsUpdate: (state, action) => {
            const index = state.senderId.data.findIndex(x => x.id === action.payload.id)
            state.senderId.data[index] = action.payload
        },
        senderIdsSave: (state, action) => {
            state.senderId.data = [
                ...action?.payload,
                ...state?.senderId?.data
            ]
        },
        deleteSenderIdsRedux: (state, action) => {
            
            const index = state.senderId.data.findIndex(x => x.id === action.payload)
            state.senderId.data.splice(index, 1)
        }
        
    }
})

export const { senderIdLoad, senderIdsUpdate, senderIdsSave, deleteSenderIdsRedux } = senderIdSlice.actions

export default senderIdSlice.reducer
