// @ts-nocheck
import { lazy } from 'react'

const Tour = lazy(() => import('../../views/examples/extensions/tour'))
const Swiper = lazy(() => import('../../views/examples/extensions/swiper'))
const Ratings = lazy(() => import('../../views/examples/extensions/ratings'))
const Sliders = lazy(() => import('../../views/examples/extensions/sliders'))
const I18nComponent = lazy(() => import('../../views/examples/extensions/i18n'))
const Pagination = lazy(() => import('../../views/examples/extensions/pagination'))
const SweetAlert = lazy(() => import('../../views/examples/extensions/sweet-alert'))
const ContextMenu = lazy(() => import('../../views/examples/extensions/context-menu'))
// const ReactPlayer = lazy(() => import('../../views/examples/extensions/react-player'))
const DragAndDrop = lazy(() => import('../../views/examples/extensions/drag-and-drop'))
const AccessControl = lazy(() => import('../../views/examples/extensions/access-control'))
const ReactHotToast = lazy(() => import('../../views/examples/extensions/react-hot-toasts'))
const CopyToClipboard = lazy(() => import('../../views/examples/extensions/copy-to-clipboard'))
const ImportComponent = lazy(() => import('../../views/examples/extensions/import-export/Import'))
const ExportComponent = lazy(() => import('../../views/examples/extensions/import-export/Export'))
const ExportSelected = lazy(() => import('../../views/examples/extensions/import-export/ExportSelected'))

const ExtensionsRoutes = [
    {
        element: <SweetAlert />,
        path: '/extensions/sweet-alert'
    },
    {
        element: <ReactHotToast />,
        path: '/extensions/react-hot-toasts'
    },
    {
        element: <Sliders />,
        path: '/extensions/slider'
    },
    {
        element: <DragAndDrop />,
        path: '/extensions/drag-and-drop'
    },
    {
        element: <Tour />,
        path: '/extensions/tour'
    },
    {
        element: <CopyToClipboard />,
        path: '/extensions/clipboard'
    },
    // {
    //     element: <ReactPlayer />,
    //     path: '/extensions/react-player'
    // },
    {
        element: <ContextMenu />,
        path: '/extensions/context-menu'
    },
    {
        element: <Swiper />,
        path: '/extensions/swiper'
    },
    {
        path: '/access-control',
        element: <AccessControl />,
        meta: {
            action: 'read',
            resource: 'ACL'
        }
    },
    {
        element: <Ratings />,
        path: '/extensions/ratings'
    },
    {
        element: <Pagination />,
        path: '/extensions/pagination'
    },
    {
        element: <ImportComponent />,
        path: '/extensions/import'
    },
    {
        element: <ExportComponent />,
        path: '/extensions/export'
    },
    {
        element: <ExportSelected />,
        path: '/extensions/export-selected'
    },
    {
        element: <I18nComponent />,
        path: '/extensions/i18n'
    }
]

export default ExtensionsRoutes
