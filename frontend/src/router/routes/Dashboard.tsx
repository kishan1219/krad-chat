// @ts-nocheck
import { lazy } from 'react'
import { Permissions } from '../../utility/Permissions'

const ModernDashboard = lazy(() => import('../../views/Dashboards/ModernDashboard'))
const ClassicDashboard = lazy(() => import('../../views/Dashboards/Dashboard'))


const KradChatDashboard = [
    {
        path: '/dashboard',
        element: <ModernDashboard />,
        meta: {
            ...Permissions.dashboardView
        }
    },
    {
        path: '/dashboard/classic',
        element: <ClassicDashboard />,
        meta: {
            ...Permissions.dashboardView
        }
    }
    //   {
    //     path: '/dashboard/ecommerce',
    //     element: <DashboardEcommerce />
    //   }
]

export default KradChatDashboard
