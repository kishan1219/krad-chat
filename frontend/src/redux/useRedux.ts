import { useAppDispatch, useAppSelector } from './hooks'

/**
 * Legacy convenience hook used across the app.
 * Keeps existing API while using typed Redux hooks internally.
 */
const useRedux = () => {
    const dispatch = useAppDispatch()
    const reduxStates = useAppSelector(state => state)

    return {
        dispatch,
        reduxStates
    }
}

export { useRedux }
