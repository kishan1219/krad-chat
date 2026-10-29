import { generatePath } from 'react-router-dom'
import { Routes } from "./routes"

type RouteItem = {
    name?: string
    path?: string
    children?: RouteItem[]
}

export const getPath = (name: string, params: Record<string, string | number> | null = null) => {
    let route: RouteItem | null = null
    const allRoutes = Routes as RouteItem[]

    allRoutes.forEach((d) => {
        if (d?.name === name) {
            route = d
        } else if (d?.children?.length) {
            d.children.forEach((c) => {
                if (c?.name === name) {
                    route = c
                }
            })
        }
    })

    if (!route) {
        throw new Error('Route Not Found!! Please check the route name.')
    }

    const path = route.path
    if (params && path) {
        return generatePath(path, params)
    }

    return path
}
