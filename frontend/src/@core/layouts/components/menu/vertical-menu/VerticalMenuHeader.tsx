// @ts-nocheck
// ** React Imports
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'

// ** Icons Imports
import { Disc, X, Circle } from 'react-feather'

// ** Config
import themeConfig from '@configs/themeConfig'
import fallbackIconLogo from '@src/assets/images/logo/krad-logo-icon.svg'
import fallbackDarkLogo from '@src/assets/images/logo/krad-technology-clean-dark.svg'
import fallbackLightLogo from '@src/assets/images/logo/krad-technology-clean-light.svg'

const VerticalMenuHeader = props => {
  // ** Props
  const { menuCollapsed, setMenuCollapsed, setMenuVisibility, setGroupOpen, menuHover } = props

  // ** Redux skin
  const skin = useSelector(state => state?.layout?.skin) || 'dark'
  const isLightSkin = skin === 'light'

  // ** Reset open group
  useEffect(() => {
    if (!menuHover && menuCollapsed) setGroupOpen([])
  }, [menuHover, menuCollapsed])

  // ** Menu toggler component
  const Toggler = () => {
    if (!menuCollapsed) {
      return (
        <Disc
          size={20}
          data-tour='toggle-icon'
          className='text-primary toggle-icon d-none d-xl-block'
          onClick={() => setMenuCollapsed(true)}
        />
      )
    } else {
      return (
        <Circle
          size={20}
          data-tour='toggle-icon'
          className='text-primary toggle-icon d-none d-xl-block'
          onClick={() => setMenuCollapsed(false)}
        />
      )
    }
  }

  // Choose logo based on expanded vs collapsed and dark vs light
  const isCollapsedIconOnly = menuCollapsed && !menuHover
  const fullLogoSrc = isLightSkin ? (themeConfig?.app?.appLogoLight || fallbackLightLogo) : (themeConfig?.app?.appLogoLogo || fallbackDarkLogo)

  return (
    <div className='navbar-header'>
      <ul className='nav navbar-nav flex-row align-items-center'>
        <li className='nav-item me-auto'>
          <NavLink
            to='/dashboard'
            className='navbar-brand d-flex align-items-center'
            style={{ marginTop: '0.2rem', textDecoration: 'none' }}
          >
            {isCollapsedIconOnly ? (
              <span className='brand-logo' style={{ display: 'inline-flex', alignItems: 'center' }}>
                <img
                  src={fallbackIconLogo}
                  alt='KRAD'
                  style={{ width: 34, height: 34, objectFit: 'contain' }}
                />
              </span>
            ) : (
              <div className='d-flex align-items-center' style={{ padding: '4px 0' }}>
                <img
                  src={fullLogoSrc}
                  alt='KRAD Technology'
                  style={{ height: 32, width: 'auto', maxWidth: 175, objectFit: 'contain' }}
                  onError={e => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = fallbackDarkLogo
                  }}
                />
              </div>
            )}
          </NavLink>
        </li>
        <li className='nav-item nav-toggle'>
          <div className='nav-link modern-nav-toggle cursor-pointer'>
            <Toggler />
            <X onClick={() => setMenuVisibility(false)} className='toggle-icon icon-x d-block d-xl-none' size={20} />
          </div>
        </li>
      </ul>
    </div>
  )
}

export default VerticalMenuHeader
