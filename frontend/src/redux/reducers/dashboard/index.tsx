// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        dashboard: {
            data: []
        }
    },
    reducers: {
        dashboardLoad: (state, action) => {
            state.dashboard = action?.payload
        }
    }
})

export const { dashboardLoad } = dashboardSlice.actions


export default dashboardSlice.reducer
