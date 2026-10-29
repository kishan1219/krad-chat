// @ts-nocheck
// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

export const voiceSmsSlice = createSlice({
    name: 'voiceSMS',
    initialState: {
        voiceSMS: {
            data: []
        }
    },
    reducers: {
        voiceCampaignList: (state, action) => {
            state.voiceSMS = action?.payload
        },
    //    fileUploadUpdate: (state, action) => {
    //         const index = state.voiceSMS.data.findIndex(x => x.id === action.payload.id)
    //         state.voiceSMS.data[index] = action.payload
    //     },
       viewVoiceCampaign: (state, action) => {
            state.voiceSMS = action?.payload
        },
        viewVoiceCampaignInfo: (state, action) => {
            state.voiceSMS = action?.payload
        },
        viewVoiceSmsCurrentStatus: (state, action) => {
            state.voiceSMS = action?.payload
        },
       voiceSmsSave: (state, action) => {
            state.voiceSMS.data = [
                ...action?.payload,
                ...state?.user?.data
            ]
        }
      
    }
})

export const {voiceSmsSave, viewVoiceCampaign, viewVoiceCampaignInfo, viewVoiceSmsCurrentStatus, voiceCampaignList} = voiceSmsSlice.actions

export default voiceSmsSlice.reducer
