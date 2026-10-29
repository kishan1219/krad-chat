// @ts-nocheck
import { createSlice } from '@reduxjs/toolkit'

const apisSlice = createSlice({
    name: 'apis',
    initialState: {
        apis: {
            data: []
        }
    },
    reducers: {
        apisLoad: (state, action) => {
            state.apis = action?.payload
        },
        apisUpdate: (state, action) => {
            const index = state.apis.data.findIndex(x => x.id === action.payload.id)
            state.apis.data[index] = action.payload
        },
        apisView: (state, action) => {
            state.viewapis = action?.payload
        },
        apisSave: (state, action) => {
            state.apis.data = [
                ...action?.payload,
                ...state?.apis?.data
            ]
        },
        apisActions: (state, action) => {
            state.apis.data = [
                ...action?.payload?.data,
                ...state?.apis?.data
            ]
        },
        apisDelete: (state, action) => {
            
            const index = state.apis.data.findIndex(x => x.id === action.payload)
            state.apis.data.splice(index, 1)
        }
    }
    
})

export const { apisLoad, apisUpdate, apisSave, apisDelete, apisActions, apisView } = apisSlice.actions

export default apisSlice.reducer
