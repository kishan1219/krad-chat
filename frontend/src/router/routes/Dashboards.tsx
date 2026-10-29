// @ts-nocheck
import { lazy } from 'react'

const DashboardAnalytics = lazy(() => import('../../views/examples/dashboard/analytics'))
const DashboardEcommerce = lazy(() => import('../../views/examples/dashboard/ecommerce'))

const DashboardsRoutes = [
    {
        path: '/dashboard/analytics',
        element: <DashboardAnalytics />
    },
    {
        path: '/dashboard/ecommerce',
        element: <DashboardEcommerce />
    }
]

export default DashboardsRoutes
