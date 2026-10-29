// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit"

const whatsappQrSlice = createSlice({
    name: 'whatsappQr',
    initialState: {
        whatsappQr: {
            data: []
        }
    },
    reducers: {
        whatsappQrLoad: (state, action) => {
            state.whatsappQr = action?.payload
        },
       
        whatsappQrSave: (state, action) => {
            state.whatsappQr.data = [
                ...action?.payload,
                ...state?.whatsappQr?.data
            ]
        },
        whatsappQrSync: (state, action) => {
            state.whatsappQr.data = [
                ...action?.payload,
                ...state?.whatsappQr?.data
            ]
        },
        whatsappQrDelete: (state, action) => {
                
                const index = state.whatsappQr.data.findIndex(x => x.id === action.payload)
                state.whatsappQr.data.splice(index, 1)
            }

    }

})

export const { whatsappQrLoad, whatsappQrSave, whatsappQRSync, whatsappQrDelete } = whatsappQrSlice.actions

export default whatsappQrSlice.reducer
