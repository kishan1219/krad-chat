// ** Redux Imports
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// ** UseJWT import to get config
import useJwt from '@src/auth/jwt/useJwt'

type JwtConfig = {
    storageTokenKeyName: string
    storageRefreshTokenKeyName: string
}

type UserPayload = Record<string, any>

interface AuthState {
    userData: UserPayload
    userLicense: unknown
    userLicenseStatus: unknown
    access_token: string | null
    otpData: UserPayload
    [key: string]: unknown
}

const config = useJwt.jwtConfig as JwtConfig

const initialUser = (): UserPayload => {
    const item = window.localStorage.getItem('kradChatData')
    // Parse stored json or return an empty object.
    return item ? JSON.parse(item) : {}
}

const initialState: AuthState = {
    userData: initialUser(),
    userLicense: null,
    userLicenseStatus: null,
    access_token: initialUser()?.access_token ?? null,
    otpData: {}
}

export const authSlice = createSlice({
    name: 'authentication',
    initialState,
    reducers: {
        handleLogin: (state, action: PayloadAction<UserPayload>) => {
            state.userData = action.payload
            state[config.storageTokenKeyName] = action.payload?.[config.storageTokenKeyName] ?? null
            state[config.storageRefreshTokenKeyName] = action.payload?.[config.storageRefreshTokenKeyName] ?? null

            localStorage.setItem('kradChatData', JSON.stringify(action.payload))
            localStorage.setItem(config.storageTokenKeyName, JSON.stringify(action.payload?.access_token ?? null))
            localStorage.setItem(config.storageRefreshTokenKeyName, JSON.stringify(action.payload?.access_token ?? null))
        },
        handleLogout: state => {
            state.userData = {}
            state[config.storageTokenKeyName] = null
            state[config.storageRefreshTokenKeyName] = null

            // Remove user, accessToken & refreshToken from localStorage.
            localStorage.removeItem('kradChatData')
            localStorage.removeItem(config.storageTokenKeyName)
            localStorage.removeItem(config.storageRefreshTokenKeyName)
        },
        handleOtp: (state, action: PayloadAction<UserPayload>) => {
            state.otpData = action.payload
            localStorage.setItem('otpData', JSON.stringify(action.payload))
        },
        handleRemoveOtp: state => {
            state.otpData = {}
            localStorage.removeItem('otpData')
        }
    }
})

export const { handleLogin, handleLogout, handleOtp, handleRemoveOtp } = authSlice.actions

export default authSlice.reducer
