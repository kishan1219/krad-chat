// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const groupSlice = createSlice({
    name: 'group',
    initialState: {
        group: {
            data: []
        }
    },
    reducers: {
        groupLoad: (state, action) => {
            state.group = action?.payload
        },
        groupUpdate: (state, action) => {
            const index = state.group.data.findIndex(x => x.id === action.payload.id)
            state.group.data[index] = action.payload
        },
        // dlrUpdate: (state, action) => {
        //     const index = state.group.data.findIndex(x => x.id === action.payload.id)
        //     state.group.data[index] = action.payload
        // },
        groupView: (state, action) => {
            state.viewdlr = action?.payload
        },
        groupSave: (state, action) => {
            state.group.data = [
                ...action?.payload,
                ...state?.group?.data
            ]
        },
        groupActions: (state, action) => {
            state.group.data = [
                ...action?.payload?.data,
                ...state?.group?.data
            ]
        },
        groupDelete: (state, action) => {

            const index = state.group.data.findIndex(x => x.id === action.payload)
            state.group.data.splice(index, 1)
        }
    }
})

export const { groupLoad, groupUpdate, groupSave, groupDelete, groupActions, groupView } = groupSlice.actions

export default groupSlice.reducer
