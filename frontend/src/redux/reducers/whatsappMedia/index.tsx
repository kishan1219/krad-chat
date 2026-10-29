// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit"

const whatsappMediaSlice = createSlice({
    name: 'whatsappMedia',
    initialState: {
        whatsappMedia: {
            data: []
        }
    },
    reducers: {
        whatsappMediaLoad: (state, action) => {
            state.whatsappMedia = action?.payload
        },
        whatsappMediaUpdate: (state, action) => {
            const index = state.whatsappMedia.data.findIndex(x => x.id === action.payload.id)
            state.whatsappMedia.data[index] = action.payload
        },
        whatsappMediaView: (state, action) => {
            state.viewwhatsappMedia = action?.payload
        },
        whatsappMediaSave: (state, action) => {
            state.whatsappMedia.data = [
                ...action?.payload,
                ...state?.whatsappMedia?.data
            ]
        },
        whatsappMediaDelete: (state, action) => {
            
            const index = state.whatsappMedia.data.findIndex(x => x.id === action.payload)
            state.whatsappMedia.data.splice(index, 1)
        }
    }
    
})

export const { whatsappMediaLoad, whatsappMediaUpdate, whatsappMediaSave, whatsappMediaDelete, whatsappMediaActions, whatsappMediaView, addCustomTemplateSave } = whatsappMediaSlice.actions

export default whatsappMediaSlice.reducer
