// @ts-nocheck
import { createSlice } from '@reduxjs/toolkit'

export const userClickedSlice = createSlice({
    name: 'userClicked',
    initialState: {
        userClicked: {
            data: []
        }
    },
    reducers: {
        userClickedLoad: (state, action) => {
            state.userClicked = action?.payload
        }
    }
})

export const { userClickedLoad } = userClickedSlice.actions

export default userClickedSlice.reducer
