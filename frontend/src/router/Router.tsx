// ** Router imports
import { lazy } from 'react'

// ** Router imports
import { useRoutes, Navigate } from 'react-router-dom'

// ** Layouts
import BlankLayout from '@layouts/BlankLayout'

// ** Hooks Imports
import { useLayout } from '@hooks/useLayout'

// ** Utils
import { getUserData, getHomeRouteForLoggedInUser } from '../utility/Utils'

// ** GetRoutes
import { DefaultRoute, getRoutes } from './routes'
import { log } from '../utility/helpers/common'

// ** Components
const Error = lazy(() => import('../views/examples/pages/misc/Error'))
const Login = lazy(() => import('../views/auth/Login'))
const HomePage = lazy(() => import('../views/home/HomePage'))
const NotAuthorized = lazy(() => import('../views/examples/pages/misc/NotAuthorized'))

const Router = () => {
    // ** Hooks
    const { layout } = useLayout()

    const allRoutes = getRoutes(layout)

    const routes = useRoutes([
        {
            path: '/',
            element: <BlankLayout />,
            children: [
                { index: true, element: <HomePage /> },
                { path: 'home', element: <HomePage /> }
            ]
        },
        {
            path: '/login',
            element: <BlankLayout />,
            children: [{ path: '/login', element: <Login /> }]
        },
        {
            path: '/authentication',
            element: <BlankLayout />,
            children: [{ path: '/authentication', element: <Login /> }]
        },
        {
            path: '/auth/not-auth',
            element: <BlankLayout />,
            children: [{ path: '/auth/not-auth', element: <NotAuthorized /> }]
        },
        {
            path: '*',
            element: <BlankLayout />,
            children: [{ path: '*', element: <Error /> }]
        },
        ...allRoutes
    ])

    return routes
}

export default Router
