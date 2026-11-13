// @ts-nocheck
// ** React Imports
import { Link } from 'react-router-dom'

// ** Reactstrap Imports
import { Button } from 'reactstrap'

// ** Custom Hooks
import { useSkin } from '@hooks/useSkin'

// ** Assets
import errorLight from '@src/assets/images/pages/error.svg'
import errorDark from '@src/assets/images/pages/error-dark.svg'
import logoDark from '../../../../assets/images/logo/krad-chat-dark.svg'

// ** Styles
import '@styles/base/pages/page-misc.scss'

const Error = () => {
  // ** Hooks
  const { skin } = useSkin()
  const source = skin === 'dark' ? errorDark : errorLight

  return (
    <div className='misc-wrapper'>
    <Link className='brand-logo' to='/'>
      <h2 className='brand-text text-primary ms-1 d-flex align-items-center'>
        <img
          style={{ height: 80, width: 225 }}
          className='img-fluid'
          src={logoDark}
          alt='Krad Chat Logo'
        />{' '}
      </h2>
    </Link>
    <div className='misc-inner p-2 p-sm-3'>
      <div className='w-100 text-center'>
        <h2 className='mb-1'>Page Not Found 🕵🏻‍♀️</h2>
        <p className='mb-2'>Oops! 😖 The requested URL was not found on this server.</p>
        <Button tag={Link} to='/dashboard' color='primary' className='btn-sm-block mb-2'>
          Back to home
        </Button>
        <div className='mt-2'>
          <img className='img-fluid' style={{ maxHeight: '380px' }} src={source} alt='Page Not Found' />
        </div>
      </div>
    </div>
  </div>
  )
}
export default Error
