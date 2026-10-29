// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const creditRequestSlice = createSlice({
    name: 'creditRequest',
    initialState: {
        creditRequest: {
            data: []
        }
    },
    reducers: {
        creditRequestLoad: (state, action) => {
            state.creditRequest = action?.payload
        },
     
        creditRequestSave: (state, action) => {
            state.creditRequest.data = [
                ...action?.payload,
                ...state?.creditRequest?.data
            ]
        },
        creditRequestReply: (state, action) => {
            state.creditRequest.data = [
                ...action?.payload,
                ...state?.creditRequest?.data
            ]
        },
        // creditRequestReply: (state, action) => {
        //     const index = state.creditRequest.data.findIndex(x => x.id === action.payload.id)
        //     state.creditRequest.data[index] = action.payload
        // },
        creditRequestDelete: (state, action) => {
            
            const index = state.creditRequest.data.findIndex(x => x.id === action.payload)
            state.creditRequest.data.splice(index, 1)
        }
    }
})

export const { creditRequestLoad, creditRequestSave, creditRequestReply, creditRequestView } = creditRequestSlice.actions

export default creditRequestSlice.reducer
