// @ts-nocheck
// ** React Imports
import { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { CreditCard } from 'react-feather'

// ** Custom Components
import NavbarUser from './NavbarUser'
import NavbarBookmarks from './NavbarBookmarks'
import BackToHome from './BackToHome'

const ThemeNavbar = props => {
  // ** Props
  const { skin, setSkin, setMenuVisibility } = props
  const user = useSelector(state => state.auth.userData)

  const formatCredit = value => {
    if (value === undefined || value === null || value === '') return '0.00'

    const numberValue = Number(value)
    if (Number.isNaN(numberValue)) return String(value)

    return numberValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const overallCreditInr = user?.overall_credit_inr

  return (
    <Fragment>
      <div className='bookmark-wrapper d-flex align-items-center'>
        <BackToHome />
        <div className='ms-2 d-flex align-items-center'>
          <div className='krad-wallet-pill' title='Current Account Balance'>
            <div className='wallet-icon-wrapper me-1'>
              <CreditCard size={14} />
            </div>
            <div className='d-flex flex-column text-start'>
              <span className='wallet-label'>Wallet</span>
              <span className='wallet-amount'>₹{formatCredit(overallCreditInr)}</span>
            </div>
          </div>
        </div>
        <NavbarBookmarks setMenuVisibility={setMenuVisibility} />
      </div>
      <NavbarUser skin={skin} setSkin={setSkin} />
    </Fragment>
  )
}

export default ThemeNavbar
