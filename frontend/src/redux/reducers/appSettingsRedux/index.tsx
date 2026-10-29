// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const appSettingSlice = createSlice({
    name: 'appSetting',
    initialState: {
        appSetting: {
            data: []
        }
    },
    reducers: {

        appSettingSave: (state, action) => {
            state.appSetting = {
                ...state?.appSetting,
                ...action?.payload
            }
        },
        userDocumentUpload: (state, action) => {
            state.appSetting.data = [
                ...action?.payload,
                ...state?.appSetting?.data
                
            ]
        },
        settingForAdmin: (state, action) => {
            state.appSetting = action?.payload
        },
        settingForClient: (state, action) => {
            state.appSetting = action?.payload
        },
        settingForPublic: (state, action) => {
            state.appSetting = action?.payload
        },
        getDocuments: (state, action) => {
            state.appSetting = action?.payload
        },
        documentDelete: (state, action) => {

            const index = state.appSetting.data.findIndex(x => x.id === action.payload)
            state.appSetting.data.splice(index, 1)
        },

        editProfiles: (state, action) => {
            state.appSetting.data = [
                ...action?.data,
                ...state?.appSetting?.data
            ]
        }
    }
})

export const { appSettingSave, documentDelete, settingForPublic, settingForClient, settingForAdmin, editProfiles, userDocumentUpload, getDocuments } = appSettingSlice.actions

export default appSettingSlice.reducer
