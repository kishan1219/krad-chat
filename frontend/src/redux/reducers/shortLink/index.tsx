// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const shortLink = createSlice({
    name: 'link',
    initialState: {
        link: {
            data: []
        }
    },
    reducers: {
        linkLoad: (state, action) => {
            state.link = action?.payload
        },

        linkSave: (state, action) => {
            state.link.data = [
                ...action?.payload,
                ...state?.link?.data
            ]
        }

    }
})

export const { linkSave, linkLoad } = shortLink.actions

export default shortLink.reducer
