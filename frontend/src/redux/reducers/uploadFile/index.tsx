// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const fileUploadSlice = createSlice({
    name: 'fileUpload',
    initialState: {
        fileUpload: {
            data: []
        }
    },
    reducers: {
        fileUploadLoad: (state, action) => {
            state.user = action?.payload
        },
       fileUploadUpdate: (state, action) => {
            const index = state.user.data.findIndex(x => x.id === action.payload.id)
            state.user.data[index] = action.payload
        },
       fileUploadView: (state, action) => {
            state.viewuser = action?.payload
        },
       fileUploadSave: (state, action) => {
            state.user.data = [
                ...action?.payload,
                ...state?.user?.data
            ]
        },
       fileUploadDelete: (state, action) => {
            const index = state.user.data.findIndex(x => x.id === action.payload)
            state.user.data.splice(index, 1)
        }
    }
})

export const {fileUploadLoad, fileUploadUpdate, fileUploadSave, fileUploadDelete, fileUploadView } = fileUploadSlice.actions

export default fileUploadSlice.reducer
