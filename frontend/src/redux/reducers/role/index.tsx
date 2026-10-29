// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const roleSlice = createSlice({
    name: 'role',
    initialState: {
        role: {
            data: []
        }
    },
    reducers: {
        roleLoad: (state, action) => {
            state.role = action?.payload
        },
        roleUpdate: (state, action) => {
            const index = state.role.data.findIndex(x => x.id === action.payload.id)
            state.role.data[index] = action.payload
        },
        roleView: (state, action) => {
            state.viewrole = action?.payload
        },
        roleSave: (state, action) => {
            state.role.data = [
                ...action?.payload,
                ...state?.role?.data
            ]
        },
        roleDelete: (state, action) => {

            const index = state.role.data.findIndex(x => x.id === action.payload)
            state.role.data.splice(index, 1)
        }
    }
})

export const { roleLoad, roleUpdate, roleSave, roleDelete, roleView } = roleSlice.actions

export default roleSlice.reducer
