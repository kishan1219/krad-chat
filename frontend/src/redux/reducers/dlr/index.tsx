// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const dlrSlice = createSlice({
    name: 'dlr',
    initialState: {
        dlr: {
            data: []
        }
    },
    reducers: {
        dlrLoad: (state, action) => {
            state.dlr = action?.payload
        },
        dlrUpdate: (state, action) => {
            const index = state.dlr.data.findIndex(x => x.id === action.payload.id)
            state.dlr.data[index] = action.payload
        },
        // dlrUpdate: (state, action) => {
        //     const index = state.dlr.data.findIndex(x => x.id === action.payload.id)
        //     state.dlr.data[index] = action.payload
        // },
        dlrView: (state, action) => {
            state.viewdlr = action?.payload
        },
        dlrSave: (state, action) => {
            state.dlr.data = [
                ...action?.payload,
                ...state?.dlr?.data
            ]
        },
        dlrActions: (state, action) => {
            state.dlr.data = [
                ...action?.payload?.data,
                ...state?.dlr?.data
            ]
        },
        dlrDelete: (state, action) => {
            
            const index = state.dlr.data.findIndex(x => x.id === action.payload)
            state.dlr.data.splice(index, 1)
        }
    }
})

export const { dlrLoad, dlrUpdate, dlrSave, dlrDelete, dlrActions, dlrView } = dlrSlice.actions

export default dlrSlice.reducer
