// @ts-nocheck
// ** React Imports
import { Link } from 'react-router-dom'

// ** Reactstrap Imports
import { Button } from 'reactstrap'

// ** Custom Hooks
import { useSkin } from '@hooks/useSkin'

// ** Utils
import { getUserData, getHomeRouteForLoggedInUser } from '@utils'

// ** Assets
import notAuthLight from '@src/assets/images/pages/not-authorized.svg'
import notAuthDark from '@src/assets/images/pages/not-authorized-dark.svg'
import logoDark from '../../../../assets/images/logo/krad-chat-dark.svg'

// ** Styles
import '@styles/base/pages/page-misc.scss'

const NotAuthorized = () => {
  // ** Hooks
  const { skin } = useSkin()

  // ** Vars
  const user = getUserData()
  const source = skin === 'dark' ? notAuthDark : notAuthLight

  return (
    <div className='misc-wrapper'>
      <Link className='brand-logo' to='/dashboard'>
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
          <h2 className='mb-1'>You are not authorized! 🔐</h2>
          <p className='mb-2 text-muted'>
           Please contact your administrator for access to this resource.
          </p>
          <Button
            tag={Link}
            color='primary'
            className='btn-sm-block mb-2 shadow-sm'
            to={user ? getHomeRouteForLoggedInUser(user.role) : '/dashboard'}
          >
            Back to Home
          </Button>
          <div className='mt-2'>
            <img className='img-fluid' style={{ maxHeight: '380px' }} src={source} alt='Not authorized page' />
          </div>
        </div>
      </div>
    </div>
  )
}
export default NotAuthorized
