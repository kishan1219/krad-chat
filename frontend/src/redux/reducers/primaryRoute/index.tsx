// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const primarySlice = createSlice({
    name: 'primary',
    initialState: {
        primary: {
            data: []
        }
    },
    reducers: {
        primaryLoad: (state, action) => {
            state.primary = action?.payload
        },
        primaryUpdate: (state, action) => {
            const index = state.primary.data.findIndex(x => x.id === action.payload.id)
            state.primary.data[index] = action.payload
        },
        primaryView: (state, action) => {
            state.viewprimary = action?.payload
        },
        primarySave: (state, action) => {
            state.primary.data = [
                ...action?.payload,
                ...state?.primary?.data
            ]
        },
        primaryDelete: (state, action) => {
            const index = state.primary.data.findIndex(x => x.id === action.payload)
            state.primary.data.splice(index, 1)
        }
    }
})

export const { primaryLoad, primaryUpdate, primarySave, primaryDelete, primaryView } = primarySlice.actions

export default primarySlice.reducer
