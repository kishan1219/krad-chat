// @ts-nocheck
// ** React Imports
import { Link } from 'react-router-dom'

// ** Reactstrap Imports
import { Button } from 'reactstrap'

// ** Custom Hooks
import { useSkin } from '@hooks/useSkin'

// ** Utils
import { getUserData, getHomeRouteForLoggedInUser } from '@utils'

// ** Styles
import '@styles/base/pages/page-misc.scss'

const NotAuthorized = () => {
  // ** Hooks
  const { skin } = useSkin()

  // ** Vars
  const user = getUserData()

  const illustration = skin === 'dark' ? 'not-authorized-dark.svg' : 'not-authorized.svg',
    source = require(`@src/assets/images/pages/${illustration}`).default
  return (
    <div className='misc-wrapper'>
      <Link className='brand-logo' to='/dashboard'>
      <h2 className='brand-text text-primary ms-1 d-flex align-items-center'>
        <img
          style={{ height: 80, width: 225 }}
          className='img-fluid'
          src={require('../../../../assets/images/logo/platform.svg').default}
        />{' '}
        {/* <h2 className='text-dark ms-1 mt-25'>{themeConfig.app.appName}</h2> */}
      </h2>
      </Link>
      <div className='misc-inner p-2 p-sm-3'>
        <div className='w-100 text-center'>
          <h2 className='mb-1'>You are not authorized! 🔐</h2>
          <p className='mb-2'>
           Please contact to the Admin for further Support
          </p>
          <Button
            tag={Link}
            color='primary'
            className='btn-sm-block mb-1'
            to={user ? getHomeRouteForLoggedInUser(user.role) : '/'}
          >
            Back to Home
          </Button>
          <img className='img-fluid' src={source} alt='Not authorized page' />
        </div>
      </div>
    </div>
  )
}
export default NotAuthorized
