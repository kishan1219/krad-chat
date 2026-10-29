// @ts-nocheck
import { lazy } from 'react'

const Typography = lazy(() => import('../../views/examples/ui-elements/typography'))
const Icons = lazy(() => import('../../views/examples/ui-elements/icons'))
const CardsBasic = lazy(() => import('../../views/examples/ui-elements/cards/basic'))
const CardsAdvance = lazy(() => import('../../views/examples/ui-elements/cards/advance'))
const CardsStatistics = lazy(() => import('../../views/examples/ui-elements/cards/statistics'))
const CardsAnalytics = lazy(() => import('../../views/examples/ui-elements/cards/analytics'))
const CardsActions = lazy(() => import('../../views/examples/ui-elements/cards/actions'))
const Accordion = lazy(() => import('../../views/examples/components/accordion'))
const Alerts = lazy(() => import('../../views/examples/components/alerts'))
const Autocomplete = lazy(() => import('../../views/examples/components/autocomplete'))
const Avatar = lazy(() => import('../../views/examples/components/avatar'))
const Badge = lazy(() => import('../../views/examples/components/badge'))
const BlockUI = lazy(() => import('../../views/examples/components/block-ui'))
const Breadcrumbs = lazy(() => import('../../views/examples/components/breadcrumbs'))
const Buttons = lazy(() => import('../../views/examples/components/buttons'))
const Carousel = lazy(() => import('../../views/examples/components/carousel'))
const Collapse = lazy(() => import('../../views/examples/components/collapse'))
const Divider = lazy(() => import('../../views/examples/components/divider'))
const Dropdown = lazy(() => import('../../views/examples/components/dropdowns'))
const ListGroup = lazy(() => import('../../views/examples/components/listGroup'))
const Modal = lazy(() => import('../../views/examples/components/modal'))
const NavComponent = lazy(() => import('../../views/examples/components/navComponent'))
const Offcanvas = lazy(() => import('../../views/examples/components/offcanvas'))
const Pagination = lazy(() => import('../../views/examples/components/pagination'))
const BadgePills = lazy(() => import('../../views/examples/components/badgePills'))
const TabPills = lazy(() => import('../../views/examples/components/tabPills'))
const Popovers = lazy(() => import('../../views/examples/components/popovers'))
const Progress = lazy(() => import('../../views/examples/components/progress'))
const Spinners = lazy(() => import('../../views/examples/components/spinners'))
const Tabs = lazy(() => import('../../views/examples/components/tabs'))
const Timeline = lazy(() => import('../../views/examples/components/timeline'))
const Toasts = lazy(() => import('../../views/examples/components/toasts'))
const Tooltips = lazy(() => import('../../views/examples/components/tooltips'))

const UiElementRoutes = [
    {
        element: <Typography />,
        path: '/ui-element/typography'
    },
    {
        element: <Icons />,
        path: '/icons/reactfeather'
    },
    {
        path: '/cards/basic',
        element: <CardsBasic />
    },
    {
        path: '/cards/advance',
        element: <CardsAdvance />
    },
    {
        path: '/cards/statistics',
        element: <CardsStatistics />
    },
    {
        path: '/cards/analytics',
        element: <CardsAnalytics />
    },
    {
        path: '/cards/action',
        element: <CardsActions />
    },
    {
        element: <Accordion />,
        path: '/components/accordion'
    },
    {
        element: <Alerts />,
        path: '/components/alerts'
    },
    {
        element: <Autocomplete />,
        path: '/components/auto-complete'
    },
    {
        element: <Avatar />,
        path: '/components/avatar'
    },
    {
        element: <Badge />,
        path: '/components/badges'
    },
    {
        element: <BlockUI />,
        path: '/components/blockui'
    },
    {
        element: <Breadcrumbs />,
        path: '/components/breadcrumbs'
    },
    {
        element: <Buttons />,
        path: '/components/buttons'
    },
    {
        element: <Carousel />,
        path: '/components/carousel'
    },
    {
        element: <Collapse />,
        path: '/components/collapse'
    },
    {
        element: <Divider />,
        path: '/components/divider'
    },
    {
        element: <Dropdown />,
        path: '/components/dropdowns'
    },
    {
        element: <ListGroup />,
        path: '/components/list-group'
    },
    {
        element: <Modal />,
        path: '/components/modals'
    },
    {
        element: <NavComponent />,
        path: '/components/nav-component'
    },
    {
        element: <Offcanvas />,
        path: '/components/offcanvas'
    },
    {
        element: <Pagination />,
        path: '/components/pagination'
    },
    {
        element: <BadgePills />,
        path: '/components/pill-badges'
    },
    {
        element: <TabPills />,
        path: '/components/pills-component'
    },
    {
        element: <Popovers />,
        path: '/components/popovers'
    },
    {
        element: <Progress />,
        path: '/components/progress'
    },
    {
        element: <Spinners />,
        path: '/components/spinners'
    },
    {
        element: <Tabs />,
        path: '/components/tabs-component'
    },
    {
        element: <Timeline />,
        path: '/components/timeline'
    },
    {
        element: <Toasts />,
        path: '/components/toasts'
    },
    {
        element: <Tooltips />,
        path: '/components/tooltips'
    }
]

export default UiElementRoutes
