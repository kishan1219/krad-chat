// @ts-nocheck

import { createSlice } from '@reduxjs/toolkit'

export const whatsappReportSlice = createSlice({
    name: 'whatsappReport',
    initialState: {
        whatsappReport: {
            data: []
        }
    },
    reducers: {
        whatsappReportLoad: (state, action) => {
            state.whatsappReport = action?.payload
        },
        whatsappAnalyticsLoad: (state, action) => {
            state.whatsappReport = action?.payload
        },
        whatsappCampaignReportLoad: (state, action) => {
            state.whatsappReport = action?.payload
        },
        whatsappReportDetails: (state, action) => {
            state.whatsappReport = action?.payload
        },
        reSendWhatsappReport: (state, action) => {
            state.whatsappReport.data = [
                ...action?.payload,
                ...state?.whatsappReport?.data
            ]
        },
        startStopWhatsappReport: (state, action) => {
            const index = state.whatsappReport.data.findIndex(x => x.id === action.payload)
            if (index !== -1) {
                state.whatsappReport.data[index] = action.payload

            }
        },
        whatsappReportFinish: (state, action) => {
            const index = state.whatsappReport.data.findIndex(x => x.id === action.payload?.id)
            if (index !== -1) {
                state.whatsappReport.data[index] = action.payload

            }
        }
        // whatsappReportFinish: (state, action) => {
        //     const index = state.whatsappReport.data.findIndex(x => x.id === action.payload)
        //     state.whatsappReport.data.splice(index, 1)
        // }
    }
})

export const { whatsappReportLoad, reSendWhatsappReport, whatsappAnalyticsLoad, whatsappReportDetails, startStopWhatsappReport, whatsappReportFinish, whatsappCampaignReportLoad } = whatsappReportSlice.actions

export default whatsappReportSlice.reducer
