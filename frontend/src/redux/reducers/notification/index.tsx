// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        notification: {
            data: []
        }
    },
    reducers: {
        notificationLoad: (state, action) => {
            state.notification = action?.payload
        },
       
        readAllNotificationRedux: (state, action) => {
            state.notification = action?.payload
        },
        readNotificationRedux: (state, action) => {
            state.notification = action?.payload
        },
       
        notificationDelete: (state, action) => {
            
            const index = state.notification.data.findIndex(x => x.id === action.payload)
            state.notification.data.splice(index, 1)
        }
    }
})

export const { notificationLoad, notificationDelete, readNotificationRedux, readAllNotificationRedux } = notificationSlice.actions

export default notificationSlice.reducer
