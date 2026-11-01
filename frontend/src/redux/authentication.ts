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
            const accessToken = action.payload?.access_token ?? action.payload?.[config.storageTokenKeyName] ?? null
            const refreshToken = action.payload?.refresh_token ?? action.payload?.[config.storageRefreshTokenKeyName] ?? null

            state.access_token = accessToken
            state[config.storageTokenKeyName] = accessToken
            state[config.storageRefreshTokenKeyName] = refreshToken

            localStorage.setItem('kradChatData', JSON.stringify(action.payload))
            localStorage.setItem('access_token', JSON.stringify(accessToken))
            localStorage.setItem('refresh_token', JSON.stringify(refreshToken))
            if (config.storageTokenKeyName && config.storageTokenKeyName !== 'access_token') {
                localStorage.setItem(config.storageTokenKeyName, JSON.stringify(accessToken))
            }
            if (config.storageRefreshTokenKeyName && config.storageRefreshTokenKeyName !== 'refresh_token') {
                localStorage.setItem(config.storageRefreshTokenKeyName, JSON.stringify(refreshToken))
            }
        },
        handleLogout: state => {
            state.userData = {}
            state.access_token = null
            state[config.storageTokenKeyName] = null
            state[config.storageRefreshTokenKeyName] = null

            // Remove user, accessToken & refreshToken from localStorage.
            localStorage.removeItem('kradChatData')
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            if (config.storageTokenKeyName) localStorage.removeItem(config.storageTokenKeyName)
            if (config.storageRefreshTokenKeyName) localStorage.removeItem(config.storageRefreshTokenKeyName)
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
