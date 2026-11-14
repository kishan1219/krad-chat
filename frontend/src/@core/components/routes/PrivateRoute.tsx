// @ts-nocheck
// ** React Imports
import { Navigate } from 'react-router-dom'
import { useContext, Suspense } from 'react'

// ** Context Imports
import { AbilityContext } from '@src/utility/context/Can'
import { log } from '../../../utility/helpers/common'

const LoadingFallback = () => (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status" style={{ width: '2.2rem', height: '2.2rem', color: '#ff8c21' }}>
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
)

const PrivateRoute = ({ children, route }) => {
    // ** Hooks & Vars
    const ability = useContext(AbilityContext)
    const user = JSON.parse(localStorage.getItem('kradChatData') || 'null')

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
            // Permit authenticated users to manage and view their WhatsApp configuration without getting blocked
            if (action === 'whatsapp-configurations' || action === 'whatsapp-sms' || (route.path && route.path.includes('whatsapp'))) {
                return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
            }
            return <Navigate to='/misc/not-authorized' replace />
        }
    }

    return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
}

export default PrivateRoute
