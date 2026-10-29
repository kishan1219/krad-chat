// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'
import { log } from '../../../utility/helpers/common'

export const invalidSlice = createSlice({
    name: 'series',
    initialState: {
        series: {
            data: []
        }
    },
    reducers: {
        invalidLoad: (state, action) => {

            state.series = action?.payload
        },

        invalidSave: (state, action) => {
            // log(action)
            state.series.data = [
                ...action.payload,
                ...state.series?.data
            ]
        },
        invalidDelete: (state, action) => {

            const index = state.series.data.findIndex(x => x.id === action.payload)
            state.series.data.splice(index, 1)
        }
    }
})


export const { invalidLoad, invalidSave, invalidDelete } = invalidSlice.actions

export default invalidSlice.reducer
