// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const ipSlice = createSlice({
    name: 'ip',
    initialState: {
        ip: {
            data: []
        }
    },
    reducers: {
        ipLoad: (state, action) => {
            state.ip = action?.payload
        },
        ipUpdate: (state, action) => {
            const index = state.ip.data.findIndex(x => x.id === action.payload.id)
            state.ip.data[index] = action.payload
        },
        ipView: (state, action) => {
            state.viewip = action?.payload
        },
        ipSave: (state, action) => {
            state.ip.data = [
                ...action?.payload,
                ...state?.ip?.data
            ]
        },
        ipDelete: (state, action) => {
            const index = state.ip.data.findIndex(x => x.id === action.payload)
            state.ip.data.splice(index, 1)
        }
    }
})

export const { ipLoad, ipUpdate, ipSave, ipDelete, ipView } = ipSlice.actions

export default ipSlice.reducer
