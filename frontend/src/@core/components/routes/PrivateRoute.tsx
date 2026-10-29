// @ts-nocheck
// ** React Imports
import { Navigate } from 'react-router-dom'
import { useContext, Suspense } from 'react'

// ** Context Imports
import { AbilityContext } from '@src/utility/context/Can'
import { log } from '../../../utility/helpers/common'

const PrivateRoute = ({ children, route }) => {
    // ** Hooks & Vars
    const ability = useContext(AbilityContext)
    const user = JSON.parse(localStorage.getItem('nrtData'))

    if (route) {
        let action = null
        let resource = null
        let restrictedRoute = false

        if (route.meta) {
            action = route.meta.action
            resource = route.meta.resource
            restrictedRoute = route.meta.restricted
        }
        // log("check", ability)
        if (!user) {
            return <Navigate to='/authentication' />
        }
        if (user && restrictedRoute) {
            return <Navigate to='/' />
        }
        if (user && restrictedRoute && user.role === 'client') {
            return <Navigate to='/access-control' />
        }
        if (user && !ability.can(action || 'read', resource)) {
            return <Navigate to='/misc/not-authorized' replace />
        }
    }

    return <Suspense fallback={null}>{children}</Suspense>
}

export default PrivateRoute
