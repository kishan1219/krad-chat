// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const creditSlice = createSlice({
    name: 'credit',
    initialState: {
        credit: {
            data: []
        }
    },
    reducers: {
        creditLoad: (state, action) => {
            state.credit = action?.payload
        },

        creditSave: (state, action) => {
            state.credit.data = [
                ...action?.payload,
                ...state?.credit?.data
            ]
        }

    }
})

export const { creditLoad, creditSave } = creditSlice.actions

export default creditSlice.reducer
