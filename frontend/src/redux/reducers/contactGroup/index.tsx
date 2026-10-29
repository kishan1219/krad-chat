// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const contactGroupSlice = createSlice({
    name: 'contactGroup',
    initialState: {
        contactGroup: {
            data: []
        }
    },
    reducers: {
        contactGroupLoad: (state, action) => {
            state.contactGroup = action?.payload
        },
        contactGroupUpdate: (state, action) => {
            const index = state.contactGroup.data.findIndex(x => x.id === action.payload.id)
            state.contactGroup.data[index] = action.payload
        },
        contactGroupView: (state, action) => {
            state.viewcontactGroup = action?.payload
        },
        contactGroupSave: (state, action) => {
            state.contactGroup.data = [
                ...action?.payload,
                ...state?.contactGroup?.data
            ]
        },
        contactGroupDelete: (state, action) => {
            const index = state.contactGroup.data.findIndex(x => x.id === action.payload)
            state.contactGroup.data.splice(index, 1)
        }
    }
})

export const { contactGroupLoad, contactGroupUpdate, contactGroupSave, contactGroupDelete, contactGroupView } = contactGroupSlice.actions

export default contactGroupSlice.reducer
