// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const campaignSlice = createSlice({
    name: 'campaign',
    initialState: {
        campaign: {
            data: []
        }
    },
    reducers: {
        campaignLoad: (state, action) => {
            state.campaign = action?.payload
        },
        campaignDetails: (state, action) => {
            state.campaign = action?.payload
        },
        reSendCampaign: (state, action) => {
            state.campaign.data = [
                ...action?.payload,
                ...state?.campaign?.data
            ]
        },
        startStopCampaign: (state, action) => {
            const index = state.campaign.data.findIndex(x => x.id === action.payload)
            if (index !== -1) {
                state.campaign.data[index] = action.payload

            }
        },
        campaignFinish: (state, action) => {
            const index = state.campaign.data.findIndex(x => x.id === action.payload?.id)
            if (index !== -1) {
                state.campaign.data[index] = action.payload

            }
        }
        // campaignFinish: (state, action) => {
        //     const index = state.campaign.data.findIndex(x => x.id === action.payload)
        //     state.campaign.data.splice(index, 1)
        // }
    }
})

export const { campaignLoad, reSendCampaign, campaignDetails, startStopCampaign, campaignFinish } = campaignSlice.actions

export default campaignSlice.reducer
