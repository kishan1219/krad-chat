// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const dltSlice = createSlice({
    name: 'dlt',
    initialState: {
        dlt: {
            data: []
        }
    },
    reducers: {
        dltLoad: (state, action) => {
            state.dlt = action?.payload
        },
        dltUpdate: (state, action) => {
            const index = state.dlt.data.findIndex(x => x.id === action.payload.id)
            state.dlt.data[index] = action.payload
        },
        dltView: (state, action) => {
            state.viewdlt = action?.payload
        },
        dltSave: (state, action) => {
            state.dlt.data = [
                ...action?.payload,
                ...state?.dlt?.data
            ]
        },
        dltImportRedux: (state, action) => {
            state.dlt.data = [
                ...action?.payload,
                ...state?.dlt?.data
            ]
        },
        priorityDlt: (state, action) => {
            state.dlt.data = [
                ...action?.payload,
                ...state?.dlt?.data
            ]
        },
        dltDelete: (state, action) => {

            const index = state.dlt.data.findIndex(x => x.id === action.payload)
            state.dlt.data.splice(index, 1)
        }
    }
})

export const { dltLoad, dltUpdate, dltSave, dltImportRedux, dltDelete, dltView, priorityDlt } = dltSlice.actions

export default dltSlice.reducer
