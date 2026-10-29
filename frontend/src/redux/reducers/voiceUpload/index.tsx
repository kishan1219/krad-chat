// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const voiceUploadSlice = createSlice({
    name: 'voiceUpload',
    initialState: {
        voiceUpload: {
            data: []
        },
        allVoiceStatus: {
            data: []
        }
    },
    reducers: {
        uploadVoiceLoad: (state, action) => {
            state.voiceUpload = action?.payload
        },
        allVoiceStatus: (state, action) => {
            state.allVoiceStatus = action?.payload
        },
        uploadVoiceUpdate: (state, action) => {
            const index = state.voiceUpload.data.findIndex(x => x.id === action.payload.id)
            state.voiceUpload.data[index] = action.payload
        },
        uploadVoiceSave: (state, action) => {
            state.user.data = [
                ...action?.payload,
                ...state?.user?.data
            ]
        },
        uploadVoiceView: (state, action) => {
            state.viewuser = action?.payload
        },

        uploadVoiceDelete: (state, action) => {
            const index = state.voiceUpload.data.findIndex(x => x.id === action.payload)
            state.voiceUpload.data.splice(index, 1)
        }


    }
})

export const { uploadVoiceSave, uploadVoiceDelete, uploadVoiceView, uploadVoiceUpdate, uploadVoiceLoad, allVoiceStatus } = voiceUploadSlice.actions

export default voiceUploadSlice.reducer
