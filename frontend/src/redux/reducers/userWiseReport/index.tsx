// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const userWiseReportSlice = createSlice({
    name: 'userWiseReport',
    initialState: {
        userWiseReport: {
            data: []
        }
    },

    reducers: {
        userReport: (state, action) => {
            state.userWiseReport = action?.payload
        },
        userMonthlyReport: (state, action) => {
            state.userWiseReport = action?.payload
        },

        userReportSave: (state, action) => {
            state.userWiseReport.data = [
                ...action?.payload,
                ...state?.userWiseReport?.data
            ]
        },
        userReportUpdate: (state, action) => {
            const index = state.userWiseReport.data.findIndex(x => x.id === action.payload.id)
            state.userWiseReport.data[index] = action.payload
        }
    }
})

export const { userReport, userReportSave, userReportUpdate, userMonthlyReport } = userWiseReportSlice.actions

export default userWiseReportSlice.reducer
