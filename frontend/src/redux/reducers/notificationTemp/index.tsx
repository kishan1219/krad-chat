// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const notificationTempSlice = createSlice({
    name: 'notificationTemp',
    initialState: {
        notificationTemp: {
            data: []
        }
    },
    reducers: {
        notificationTempLoad: (state, action) => {
            state.notificationTemp = action?.payload
        },
        notificationTempUpdate: (state, action) => {
            const index = state.notificationTemp.data.findIndex(x => x.id === action.payload.id)
            state.notificationTemp.data[index] = action.payload
        },
        notificationTempView: (state, action) => {
            state.viewnotificationTemp = action?.payload
        },
        notificationTempSave: (state, action) => {
            state.notificationTemp.data = [
                ...action?.payload,
                ...state?.notificationTemp?.data
            ]
        },
        priorityDlt: (state, action) => {
            state.notificationTemp.data = [
                ...action?.payload,
                ...state?.notificationTemp?.data
            ]
        },
        notificationTempDelete: (state, action) => {

            const index = state.notificationTemp.data.findIndex(x => x.id === action.payload)
            state.notificationTemp.data.splice(index, 1)
            // const index = state.notificationTemp.data.findIndex(x => x.id === action.payload)
            // if (index !== -1) {
            //     state.notificationTemp.data[index] = action.payload

            // }
        }
    }
})

export const { notificationTempLoad, notificationTempUpdate, notificationTempSave, notificationTempDelete, notificationTempView, priorityDlt } = notificationTempSlice.actions

export default notificationTempSlice.reducer
