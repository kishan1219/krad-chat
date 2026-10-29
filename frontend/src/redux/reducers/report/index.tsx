// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'
import { log } from '../../../utility/helpers/common'

export const reportSlice = createSlice({
    name: 'report',
    initialState: {
        report: {
            data: []
        }
    },
    reducers: {
       
        reportExportById: (state, action) => {
            state.report.data = [
                ...action?.payload,
                ...state?.report?.data
            ]
        },
        reportExportBySender: (state, action) => {
            state.report.data = [
                ...action?.payload,
                ...state?.report?.data
            ]
        },
        reportExportByMobile: (state, action) => {
            state.report.data = [
                ...action?.payload,
                ...state?.report?.data
            ]
        },
        deliveryReportRedux: (state, action) => {
            state.report = action?.payload
        },
        scheduleReportRedux: (state, action) => {
            state.report = action?.payload
        },
        messageReportRedux: (state, action) => {
            state.report = action?.payload
        },
        reportMobileRedux: (state, action) => {
            state.report = action?.payload
        },
        serverRedux: (state, action) => {
            state.report = action?.payload
            // log("Fsdfsdf", action)
        },
        timeRedux: (state, action) => {
            state.report = action?.payload
           
        },
        twoWayReportClick: (state, action) => {
            state.report = action?.payload
           
        },
        twoWayReportResponse: (state, action) => {
            state.report = action?.payload
           
        }
    }
})

export const { reportExportById, reportMobileRedux, reportExportBySender, reportExportByMobile, deliveryReportRedux, serverRedux, scheduleReportRedux, messageReportRedux, timeRedux, twoWayReportClick, twoWayReportResponse } = reportSlice.actions

export default reportSlice.reducer
