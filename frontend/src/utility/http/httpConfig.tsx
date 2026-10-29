// @ts-nocheck
// ** Api Endpoints

export default {

    // ** This will be prefixed in authorization header with token
    // ? e.g. Authorization: Bearer <token>
    tokenType: 'Bearer',

    // ** Value of this property will be used as key to store JWT token in storage
    storageTokenKeyName: 'access_token',
    storageRefreshTokenKeyName: 'access_token',

    // base api urls
    baseUrl: process.env.REACT_APP_API_URL || 'http://127.0.0.1:4000/api/',
    baseUrl2: process.env.REACT_APP_ASSET_URL || 'http://127.0.0.1:4000/',
    // baseUrl: `https://${domain}/api/`,
    // baseUrl2: `https://${domain}/`,

    // baseUrl2: `http://${localDomain}/`,
    // Api Endpoints

    loginEndpoint: '/jwt/login',
    registerEndpoint: '/jwt/register',
    refreshEndpoint: '/jwt/refresh-token',
    logoutEndpoint: '/jwt/logout',
    socketChatUrl: process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:4000/ws',
    socketNotificationUrl: '127.0.0.1',
    socketNotificationPort: 4000,
    enableSocket: true
}
