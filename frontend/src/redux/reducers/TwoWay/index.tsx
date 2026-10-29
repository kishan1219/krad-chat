// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const twoWaySlice = createSlice({
    name: 'twoWay',
    initialState: {
        twoWay: {
            data: []
        }
    },
    reducers: {
        twoWayLoad: (state, action) => {
            state.twoWay = action?.payload
        },
        twoWayUpdate: (state, action) => {
            const index = state.twoWay.data.findIndex(x => x.id === action.payload.id)
            state.twoWay.data[index] = action.payload
        },
        twoWayView: (state, action) => {
            state.viewtwoWay = action?.payload
        },
        twoWaySave: (state, action) => {
            state.twoWay.data = [
                ...action?.payload,
                ...state?.twoWay?.data
            ]
        },
        
        twoWayDelete: (state, action) => {

            const index = state.twoWay.data.findIndex(x => x.id === action.payload)
            state.twoWay.data.splice(index, 1)
        }
    }
})

export const { twoWayLoad, twoWayUpdate, twoWaySave, twoWayDelete, twoWayView } = twoWaySlice.actions

export default twoWaySlice.reducer
