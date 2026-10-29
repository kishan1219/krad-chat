// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const adminOperationSlice = createSlice({
    name: 'adminOperation',
    initialState: {
        adminOperation: {
            data: []
        }
    },
    reducers: {
        // adminOperationLoad: (state, action) => {
        //     state.adminOperation = action?.payload
        // },
        // adminOperationUpdate: (state, action) => {
        //     const index = state.adminOperation.data.findIndex(x => x.id === action.data.id)
        //     state.adminOperation.data[index] = action.payload
        // },
        // adminOperationView: (state, action) => {
        //     state.viewadminOperation = action?.payload
        // },
        routeAssign: (state, action) => {
            state.adminOperation.data = [
                ...action?.payload,
                ...state?.adminOperation?.data
            ]
        },
        
        getRoute: (state, action) => {
            state.adminOperation = action?.payload
        },
        priorityUser: (state, action) => {
            state.adminOperation.data = [
                ...action?.payload,
                ...state?.adminOperation?.data
            ]
        },
        campaignManage: (state, action) => {
            state.adminOperation.data = [
                ...action?.payload,
                ...state?.adminOperation?.data
            ]
        },
        userOverview: (state, action) => {
            state.adminOperation.data = [
                ...action?.payload,
                ...state?.adminOperation?.data
            ]
        }
        
        // adminOperationDelete: (state, action) => {
            
        //     const index = state.adminOperation.data.findIndex(x => x.id === action.payload)
        //     state.adminOperation.data.splice(index, 1)
        // }
    }
})

export const {  routeAssign, getRoute, priorityUser, userOverview, campaignManage  } = adminOperationSlice.actions
export default adminOperationSlice.reducer
