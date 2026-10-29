// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const secondarySlice = createSlice({
    name: 'secondary',
    initialState: {
        secondary: {
            data: []
        }
    },
    reducers: {
        secondaryLoad: (state, action) => {
            state.secondary = action?.payload
        },
        secondaryUpdate: (state, action) => {
            const index = state.secondary.data.findIndex(x => x.id === action.payload.id)
            state.secondary.data[index] = action.payload
        },
        secondaryView: (state, action) => {
            state.viewsecondary = action?.payload
        },
        secondarySave: (state, action) => {
            state.secondary.data = [
                ...action?.payload,
                ...state?.secondary?.data
            ]
        },
        secondaryDelete: (state, action) => {
            const index = state.secondary.data.findIndex(x => x.id === action.payload)
            state.secondary.data.splice(index, 1)
        }
    }
})

export const { secondaryLoad, secondaryUpdate, secondarySave, secondaryDelete, secondaryView } = secondarySlice.actions

export default secondarySlice.reducer
