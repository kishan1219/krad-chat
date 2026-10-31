// @ts-nocheck
// ** Api Endpoints

export default {

    // ** This will be prefixed in authorization header with token
    // ? e.g. Authorization: Bearer <token>
    tokenType: 'Bearer',

    // ** Value of this property will be used as key to store JWT token in storage
    storageTokenKeyName: 'access_token',
    storageRefreshTokenKeyName: 'access_token',

    // base api urls (driven strictly by environment configuration)
    baseUrl: process.env.REACT_APP_API_URL || '/api/',
    baseUrl2: process.env.REACT_APP_ASSET_URL || '/',

    // Api Endpoints
    loginEndpoint: '/jwt/login',
    registerEndpoint: '/jwt/register',
    refreshEndpoint: '/jwt/refresh-token',
    logoutEndpoint: '/jwt/logout',
    socketChatUrl: process.env.REACT_APP_WS_URL || '',
    socketNotificationUrl: '',
    socketNotificationPort: '',
    enableSocket: Boolean(process.env.REACT_APP_WS_URL)
}
