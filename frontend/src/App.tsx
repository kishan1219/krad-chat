import { Suspense } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { useAppDispatch } from './redux/hooks'
// ** Router Import
import Router from './router/Router'
import { logout } from './utility/apis/authentication'
import { isValid } from './utility/helpers/common'
import useUser from './utility/hooks/useUser'

const App = () => {
    const dispatch = useAppDispatch()
    const user = useUser()

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
        <Suspense fallback={null}>
            <Router />
        </Suspense>
    )
}

export default App
