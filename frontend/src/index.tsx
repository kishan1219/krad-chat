// ** React Imports
import { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// ** Redux Imports
import { store } from './redux/store'
import { Provider } from 'react-redux'

// ** Intl, CASL & ThemeColors Context
import ability from './configs/acl/ability'
import { AbilityContext } from './utility/context/Can'
import { ThemeContext } from './utility/context/ThemeColors'

// ** ThemeConfig
import themeConfig from './configs/themeConfig'

// ** Toast
import { Toaster } from 'react-hot-toast'

// ** i18n
import './configs/i18n'

// ** Spinner (Splash Screen)
import Spinner from './@core/components/spinner/Fallback-spinner'

// ** Ripple Button
import './@core/components/ripple-button'

// ** PrismJS
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx.min'

// ** React Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** React Hot Toast Styles
import '@styles/react/libs/react-hot-toasts/react-hot-toasts.scss'

// ** Core styles
import './@core/assets/fonts/feather/iconfont.css'
import './@core/scss/core.scss'
import './assets/scss/style.scss'
import './@core/scss/style.scss'
// ** Service Worker
import * as serviceWorker from './serviceWorker'
import { SocketContext } from './utility/context/Socket'

if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_ENABLE_FAKE_DB === 'true') {
    require('./@fake-db')
}

// ** Lazy load app
const LazyApp = lazy(() => import('./App'))

const container = document.getElementById('root')
if (!container) {
    throw new Error('Unable to find root element with id "root".')
}

const root = createRoot(container)

root.render(
    <BrowserRouter>
        <Provider store={store}>
            <Suspense fallback={<Spinner />}>
                <AbilityContext.Provider value={ability}>
                    <ThemeContext>
                        <SocketContext>
                            <LazyApp />
                            <Toaster position={themeConfig.layout.toastPosition as any} toastOptions={{ className: 'react-hot-toast', duration: 3000 }} />
                        </SocketContext>
                    </ThemeContext>
                </AbilityContext.Provider>
            </Suspense>
        </Provider>
    </BrowserRouter>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
