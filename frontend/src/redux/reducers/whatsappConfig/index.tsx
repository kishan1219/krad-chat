// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit"

const whatsappConfigSlice = createSlice({
    name: 'whatsappConfig',
    initialState: {
        whatsappConfig: {
            data: []
        }
    },
    reducers: {
        whatsappConfigLoad: (state, action) => {
            state.whatsappConfig = action?.payload
        },
        whatsappConfigUpdate: (state, action) => {
            const index = state.whatsappConfig.data.findIndex(x => x.id === action.payload.id)
            state.whatsappConfig.data[index] = action.payload
        },
        whatsappConfigView: (state, action) => {
            state.viewwhatsappConfig = action?.payload
        },
        whatsappConfigSave: (state, action) => {
            state.whatsappConfig.data = [
                ...action?.payload,
                ...state?.whatsappConfig?.data
            ]
        },
        waPhoneNumberVerify: (state, action) => {
            state.whatsappConfig.data = [
                ...action?.payload,
                ...state?.whatsappConfig?.data
            ]
        },
        waPhoneNumberRegisterRedux: (state, action) => {
            state.whatsappConfig.data = [
                ...action?.payload,
                ...state?.whatsappConfig?.data
            ]
        },
        addCustomTemplateSave: (state, action) => {
            state.addCustomTemplate.data = [
                ...action?.payload,
                ...state?.addCustomTemplate?.data
            ]
        },
        whatsappConfigActions: (state, action) => {
            state.whatsappConfig.data = [
                ...action?.payload?.data,
                ...state?.whatsappConfig?.data
            ]
        },
        waAppSubscribe: (state, action) => {
            state.whatsappConfig.data = [
                ...action?.payload?.data,
                ...state?.whatsappConfig?.data
            ]
        },
        waTokenDebug: (state, action) => {
            state.whatsappConfig.data = [
                ...action?.payload?.data,
                ...state?.whatsappConfig?.data
            ]
        },
        whatsappConfigDelete: (state, action) => {
            
            const index = state.whatsappConfig.data.findIndex(x => x.id === action.payload)
            state.whatsappConfig.data.splice(index, 1)
        }
    }
    
})

export const { whatsappConfigLoad, whatsappConfigUpdate, waAppSubscribe, waTokenDebug, waPhoneNumberRegisterRedux, whatsappConfigSave, whatsappConfigDelete, whatsappConfigActions, waPhoneNumberVerify, whatsappConfigView, addCustomTemplateSave } = whatsappConfigSlice.actions

export default whatsappConfigSlice.reducer
