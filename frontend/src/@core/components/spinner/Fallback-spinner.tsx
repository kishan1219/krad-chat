// @ts-nocheck
// ** Logo
import fallbackLoaderLogo from '@src/assets/images/logo/platform.svg'

const SpinnerComponent = () => {
  return (
    <div className='fallback-spinner app-loader'>
      <img className='fallback-logo' src={fallbackLoaderLogo} alt='logo' style={{ height: 100, width: 225 }} />
      <div className='loading'>
        <div className='effect-1 effects'></div>
        <div className='effect-2 effects'></div>
        <div className='effect-3 effects'></div>
      </div>
    </div>
  )
}

export default SpinnerComponent
