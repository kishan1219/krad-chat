import { Suspense, useEffect } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { useAppDispatch } from './redux/hooks'
// ** Router Import
import Router from './router/Router'
import { logout } from './utility/apis/authentication'
import { isValid } from './utility/helpers/common'
import useUser from './utility/hooks/useUser'
import ErrorBoundary from './@core/components/ErrorBoundary'
import { startSilentRenewalHeartbeat } from './utility/auth/tokenManager'

const App = () => {
    const dispatch = useAppDispatch()
    const user = useUser()

    // Silent background token heartbeat renewal (5 minutes prior to JWT expiry)
    useEffect(() => {
        const stopHeartbeat = startSilentRenewalHeartbeat()
        return () => stopHeartbeat()
    }, [])

    const { isLeader } = useIdleTimer({
        crossTab: true,
        leaderElection: true,
        timeout: Number(isValid(user?.locktimeout) ? user?.locktimeout : 30) * 60000,
        onIdle: () => {
            if (isLeader() && isValid(user?.id)) {
                logout({
                    dispatch
                })
            }
        }
    })

    return (
        <ErrorBoundary fallbackTitle="Application View Unavailable">
            <Suspense fallback={null}>
                <Router />
            </Suspense>
        </ErrorBoundary>
    )
}

export default App
