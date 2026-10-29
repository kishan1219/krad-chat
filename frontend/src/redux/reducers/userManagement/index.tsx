// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: {
            data: []
        }
    },
    reducers: {
        userLoad: (state, action) => {
            state.user = action?.payload
        },
        
        loginLogLoad: (state, action) => {
            state.user = action?.payload
        },
        userUpdate: (state, action) => {
            const index = state.user.data.findIndex(x => x.id === action.payload.id)
            state.user.data[index] = action.payload
        },
        userView: (state, action) => {
            state.viewuser = action?.payload
        },
        userSave: (state, action) => {
            state.user.data = [
                ...action?.payload,
                ...state?.user?.data
            ]
        },
        userDelete: (state, action) => {
            const index = state.user.data.findIndex(x => x.id === action.payload)
            state.user.data.splice(index, 1)
        },
        userEnableApiSecurity: (state, action) => {
            state.user.data = [
                ...action?.payload,
                ...state?.user?.data
            ]
        },
        userWiseCreditRedux: (state, action) => {
            state.user = action?.payload
        }
    }
})

export const { userLoad, userUpdate, userSave, userDelete, loginLogLoad, userView, userEnableApiSecurity, userWiseCreditRedux } = userSlice.actions

export default userSlice.reducer
