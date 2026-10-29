// ** Redux Imports
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// ** ThemeConfig Import
import themeConfig from '@configs/themeConfig'

interface LayoutState {
    skin: string
    isRTL: boolean
    layout: string
    lastLayout: string
    menuCollapsed: boolean
    footerType: string
    navbarType: string
    menuHidden: boolean
    contentWidth: string
    navbarColor: string
}

const readLocalStorageValue = <T>(key: string, fallbackValue: T): T => {
    const item = window.localStorage.getItem(key)
    if (!item) return fallbackValue

    try {
        return JSON.parse(item) as T
    } catch {
        return fallbackValue
    }
}

const initialState: LayoutState = {
    skin: readLocalStorageValue('skin', themeConfig.layout.skin),
    isRTL: readLocalStorageValue('direction', themeConfig.layout.isRTL),
    layout: themeConfig.layout.type,
    lastLayout: themeConfig.layout.type,
    menuCollapsed: readLocalStorageValue('menuCollapsed', themeConfig.layout.menu.isCollapsed),
    footerType: themeConfig.layout.footer.type,
    navbarType: themeConfig.layout.navbar.type,
    menuHidden: themeConfig.layout.menu.isHidden,
    contentWidth: themeConfig.layout.contentWidth,
    navbarColor: themeConfig.layout.navbar.backgroundColor
}

export const layoutSlice = createSlice({
    name: 'layout',
    initialState,
    reducers: {
        handleRTL: (state, action: PayloadAction<boolean>) => {
            state.isRTL = action.payload
            window.localStorage.setItem('direction', JSON.stringify(action.payload))
        },
        handleSkin: (state, action: PayloadAction<string>) => {
            state.skin = action.payload
            window.localStorage.setItem('skin', JSON.stringify(action.payload))
        },
        handleLayout: (state, action: PayloadAction<string>) => {
            state.layout = action.payload
        },
        handleFooterType: (state, action: PayloadAction<string>) => {
            state.footerType = action.payload
        },
        handleNavbarType: (state, action: PayloadAction<string>) => {
            state.navbarType = action.payload
        },
        handleMenuHidden: (state, action: PayloadAction<boolean>) => {
            state.menuHidden = action.payload
        },
        handleLastLayout: (state, action: PayloadAction<string>) => {
            state.lastLayout = action.payload
        },
        handleNavbarColor: (state, action: PayloadAction<string>) => {
            state.navbarColor = action.payload
        },
        handleContentWidth: (state, action: PayloadAction<string>) => {
            state.contentWidth = action.payload
        },
        handleMenuCollapsed: (state, action: PayloadAction<boolean>) => {
            state.menuCollapsed = action.payload
            window.localStorage.setItem('menuCollapsed', JSON.stringify(action.payload))
        }
    }
})

export const {
    handleRTL,
    handleSkin,
    handleLayout,
    handleLastLayout,
    handleMenuHidden,
    handleNavbarType,
    handleFooterType,
    handleNavbarColor,
    handleContentWidth,
    handleMenuCollapsed
} = layoutSlice.actions

export default layoutSlice.reducer
