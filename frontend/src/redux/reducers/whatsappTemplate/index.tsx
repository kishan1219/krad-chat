// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit"

const whatsappTemplateSlice = createSlice({
    name: 'whatsappTemplate',
    initialState: {
        whatsappTemplate: {
            data: []
        }
    },
    reducers: {
        whatsappTemplateLoad: (state, action) => {
            state.whatsappTemplate = action?.payload
        },
        whatsappTemplateUpdate: (state, action) => {
            const index = state.whatsappTemplate.data.findIndex(x => x.id === action.payload.id)
            state.whatsappTemplate.data[index] = action.payload
        },
        whatsappTemplateView: (state, action) => {
            state.viewwhatsappTemplate = action?.payload
        },
        whatsappTemplateSave: (state, action) => {
            state.whatsappTemplate.data = [
                ...action?.payload,
                ...state?.whatsappTemplate?.data
            ]
        },
        whatsappTemplateFetch: (state, action) => {
            state.whatsappTemplate.data = [
                ...action?.payload,
                ...state?.whatsappTemplate?.data
            ]
        },
        whatsappTemplateActions: (state, action) => {
            state.whatsappTemplate.data = [
                ...action?.payload?.data,
                ...state?.whatsappTemplate?.data
            ]
        },
        whatsappTemplateDelete: (state, action) => {
            
            const index = state.whatsappTemplate.data.findIndex(x => x.id === action.payload)
            state.whatsappTemplate.data.splice(index, 1)
        }
    }
    
})

export const { whatsappTemplateLoad, whatsappTemplateUpdate, whatsappTemplateSave, whatsappTemplateDelete, whatsappTemplateActions, whatsappTemplateView, whatsappTemplateFetch } = whatsappTemplateSlice.actions

export default whatsappTemplateSlice.reducer
