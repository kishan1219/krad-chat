// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const whatsappMessageSendSlice = createSlice({
    name: 'whatsappMessageSend',
    initialState: {
        whatsappMessageSend: {
            data: []
        }
    },
    reducers: {
       
        whatsappMessageSendSave: (state, action) => {
            state.whatsappMessageSend.data = [
                ...action?.payload,
                ...state?.whatsappMessageSend?.data
            ]
        }
    }
})

export const { whatsappMessageSendSave } = whatsappMessageSendSlice.actions

export default whatsappMessageSendSlice.reducer
