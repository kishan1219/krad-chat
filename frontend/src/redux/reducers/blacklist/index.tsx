// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const blacklistSlice = createSlice({
    name: 'blacklist',
    initialState: {
        blacklist: {
            data: []
        }
    },
    reducers: {
        blacklistLoad: (state, action) => {
            state.blacklist = action?.payload
        },
        blacklistUpdate: (state, action) => {
            const index = state.blacklist.data.findIndex(x => x.id === action.payload.id)
            state.blacklist.data[index] = action.payload
        },
        blacklistView: (state, action) => {
            state.viewblacklist = action?.payload
        },
        blacklistSave: (state, action) => {
            state.blacklist.data = [
                ...action?.payload,
                ...state?.blacklist?.data
            ]
        },
        blacklistDelete: (state, action) => {
            
            const index = state.blacklist.data.findIndex(x => x.id === action.payload)
            state.blacklist.data.splice(index, 1)
        }
    }
})

export const { blacklistLoad, blacklistUpdate, blacklistSave, blacklistDelete, blacklistView } = blacklistSlice.actions

export default blacklistSlice.reducer
