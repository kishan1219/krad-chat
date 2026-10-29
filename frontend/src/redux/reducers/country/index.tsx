// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const countrySlice = createSlice({
    name: 'country',
    initialState: {
        country: {
            data: []
        }
    },
    reducers: {
        countryLoad: (state, action) => {
            state.country = action?.payload
        },
        countryUpdate: (state, action) => {
            const index = state.country.data.findIndex(x => x.id === action.payload.id)
            state.country.data[index] = action.payload
        },
        countryView: (state, action) => {
            state.viewdlr = action?.payload
        },
        countrySave: (state, action) => {
            state.country.data = [
                ...action?.payload,
                ...state?.country?.data
            ]
        },
      
        countryDelete: (state, action) => {

            const index = state.country.data.findIndex(x => x.id === action.payload)
            state.country.data.splice(index, 1)
        }
    }
})

export const { countryLoad, countryUpdate, countrySave, countryDelete, countryView } = countrySlice.actions

export default countrySlice.reducer
