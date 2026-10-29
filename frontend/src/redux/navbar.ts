// ** Redux Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

type BookmarkId = number | string

interface BookmarkItem {
    id: BookmarkId
    isBookmarked?: boolean
    [key: string]: any
}

interface NavbarState {
    query: string
    bookmarks: BookmarkItem[]
    suggestions: BookmarkItem[]
    activeTab: string
}

interface BookmarksResponse {
    data: BookmarkItem[]
    bookmarks: BookmarkItem[]
}

export const getBookmarks = createAsyncThunk<BookmarksResponse>('layout/getBookmarks', async () => {
    const response = await axios.get('/api/bookmarks/data')
    return {
        data: response.data.suggestions,
        bookmarks: response.data.bookmarks
    }
})

export const updateBookmarked = createAsyncThunk<BookmarkId, BookmarkId>('layout/updateBookmarked', async id => {
    await axios.post('/api/bookmarks/update', { id })
    return id
})

const initialState: NavbarState = {
    query: '',
    bookmarks: [],
    suggestions: [],
    activeTab: '1'
}

export const layoutSlice = createSlice({
    name: 'layout',
    initialState,
    reducers: {
        handleSearchQuery: (state, action: PayloadAction<string>) => {
            state.query = action.payload
        },
        setActiveTab: (state, action: PayloadAction<string>) => {
            state.activeTab = action.payload
        }
    },
    extraReducers: builder => {
        builder
            .addCase(getBookmarks.fulfilled, (state, action) => {
                state.suggestions = action.payload.data
                state.bookmarks = action.payload.bookmarks
            })
            .addCase(updateBookmarked.fulfilled, (state, action) => {
                let objectToUpdate: BookmarkItem | undefined

                // Find and toggle the target suggestion.
                state.suggestions.find(item => {
                    if (item.id === action.payload) {
                        item.isBookmarked = !item.isBookmarked
                        objectToUpdate = item
                        return true
                    }

                    return false
                })

                const bookmarkIndex = state.bookmarks.findIndex(item => item.id === action.payload)

                if (bookmarkIndex === -1) {
                    if (objectToUpdate) state.bookmarks.push(objectToUpdate)
                } else {
                    state.bookmarks.splice(bookmarkIndex, 1)
                }
            })
    }
})

export const { handleSearchQuery, setActiveTab } = layoutSlice.actions

export default layoutSlice.reducer
