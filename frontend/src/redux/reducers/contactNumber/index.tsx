// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const contactNumberSlice = createSlice({
    name: 'contactNumber',
    initialState: {
        contactNumber: {
            data: []
        }
    },
    reducers: {
        contactNumberLoad: (state, action) => {
            state.contactNumber = action?.payload
        },
        contactNumberUpdate: (state, action) => {
            const index = state.contactNumber.data.findIndex(x => x.id === action.payload.id)
            state.contactNumber.data[index] = action.payload
        },
        contactNumberView: (state, action) => {
            state.viewcontactNumber = action?.payload
        },
        contactNumberSave: (state, action) => {
            state.contactNumber.data = [
                ...action?.payload,
                ...state?.contactNumber?.data
            ]
        },
        contactNumberDelete: (state, action) => {
            const index = state.contactNumber.data.findIndex(x => x.id === action.payload)
            state.contactNumber.data.splice(index, 1)
        }
    }
})

export const { contactNumberLoad, contactNumberUpdate, contactNumberSave, contactNumberDelete, contactNumberView } = contactNumberSlice.actions

export default contactNumberSlice.reducer
