// @ts-nocheck
// ** React Imports
import { lazy } from 'react'

const User = lazy(() => import('../../views/UserManagement/index'))

const UserRoutes = [

    {
        path: '/users',
        element: <User />
        // meta: {
        //   layout: 'blank',
        //   publicRoute: true,
        //   restricted: true
        // }
    }

]

export default UserRoutes
