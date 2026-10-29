// @ts-nocheck
import { lazy } from 'react'

const ApexCharts = lazy(() => import('../../views/examples/charts/apex'))
const ChartJS = lazy(() => import('../../views/examples/charts/chart-js'))
const Recharts = lazy(() => import('../../views/examples/charts/recharts'))

const ChartMapsRoutes = [
    {
        path: '/charts/apex',
        element: <ApexCharts />
    },
    {
        path: '/charts/chartjs',
        element: <ChartJS />
    },
    {
        path: '/charts/recharts',
        element: <Recharts />
    }
]

export default ChartMapsRoutes
