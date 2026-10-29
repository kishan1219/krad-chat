// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit"

const whatsappThreadSlice = createSlice({
    name: 'whatsappThread',
    initialState: {
        whatsappThread: {
            data: []
        }
    },
    reducers: {
        whatsappThreadLoad: (state, action) => {
            state.whatsappThread = action?.payload
        },
        whatsappThreadCaseLoad: (state, action) => {
            state.whatsappThread = action?.payload
        },
        whatsappThreadMessageSend: (state, action) => {
            state.whatsappThread.data = [
                ...action?.payload,
                ...state?.whatsappThread?.data
            ]
        },
        whatsappFileDownloaded: (state, action) => {
            state.whatsappThread.data = [
                ...action?.payload,
                ...state?.whatsappThread?.data
            ]
        }
       
        // whatsappThreadSave: (state, action) => {
        //     state.whatsappThread.data = [
        //         ...action?.payload,
        //         ...state?.whatsappThread?.data
        //     ]
        // }
    }

})

export const { whatsappThreadLoad, whatsappThreadCaseLoad, whatsappThreadMessageSend, whatsappFileDownloaded } = whatsappThreadSlice.actions

export default whatsappThreadSlice.reducer
