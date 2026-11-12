// @ts-nocheck
// ** Dropdowns Imports
import IntlDropdown from './IntlDropdown'
import CartDropdown from './CartDropdown'
import UserDropdown from './UserDropdown'
import NavbarSearch from './NavbarSearch'
import NotificationDropdown from './NotificationDropdown'

// ** Third Party Components
import { Sun, Moon, HelpCircle } from 'react-feather'

// ** Reactstrap Imports
import { NavItem, NavLink, UncontrolledTooltip } from 'reactstrap'
import ProductTour, { createProductTour } from '../../../../views/tour/ProductTour'

const NavbarUser = props => {
  // ** Props
  const { skin, setSkin } = props

  // ** Function to toggle Theme (Light/Dark)
  const ThemeToggler = () => {
    if (skin === 'dark') {
      return <Sun className='ficon' onClick={() => setSkin('light')} />
    } else {
      return <Moon className='ficon' onClick={() => setSkin('dark')} />
    }
  }

  const handleStartTour = (e: React.MouseEvent) => {
    e.preventDefault()
    const tour = createProductTour()
    tour.start()
  }

  return (
    <ul className='nav navbar-nav align-items-center ms-auto'>
      <ProductTour />
      <NavItem className='d-none d-sm-block me-50'>
        <NavLink id='nav-tour-guide-btn' className='nav-link-style p-50' onClick={handleStartTour} style={{ cursor: 'pointer' }}>
          <HelpCircle size={18} className='ficon text-success' />
          <UncontrolledTooltip target='nav-tour-guide-btn'>Product Tour Guide</UncontrolledTooltip>
        </NavLink>
      </NavItem>
      <NavItem className='d-none d-lg-block'>
        <NavLink className='nav-link-style'>
          <ThemeToggler />
        </NavLink>
      </NavItem>
      <NotificationDropdown />
      <UserDropdown />
    </ul>
  )
}
export default NavbarUser
