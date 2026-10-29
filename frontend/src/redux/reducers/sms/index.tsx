// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const smsSlice = createSlice({
    name: 'sms',
    initialState: {
        sms: {
            data: []
        }
    },
    reducers: {
        smsLoad: (state, action) => {
            state.sms = action?.payload
        },
    
        smsSave: (state, action) => {
            state.sms.data = [
                ...action?.payload,
                ...state?.sms?.data
            ]
        },
        smsTwoWaySave: (state, action) => {
            state.sms.data = [
                ...action?.payload,
                ...state?.sms?.data
            ]
        }
       
    }
})

export const { smsLoad, smsSave, smsTwoWaySave } = smsSlice.actions

export default smsSlice.reducer
