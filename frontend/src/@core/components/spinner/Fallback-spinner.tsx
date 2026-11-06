// @ts-nocheck
import React from 'react'
import kradChatLogo from '@src/assets/images/logo/krad-chat-dark.svg'
import './fallback-spinner.scss'

const SpinnerComponent = () => {
  return (
    <div className='krad-splash-loader' role='status' aria-live='polite' aria-label='Loading KRAD Chat'>
      <div className='krad-splash-ambient-glow' aria-hidden='true' />
      <div className='krad-splash-content'>
        <div className='krad-splash-logo-wrap'>
          <img
            src={kradChatLogo}
            alt='KRAD CHAT'
            className='krad-splash-logo'
          />
          <div className='krad-splash-logo-glow' aria-hidden='true' />
        </div>

        {/* Animated Cyber Progress Track */}
        <div className='krad-splash-bar-wrap' aria-hidden='true'>
          <div className='krad-splash-bar-progress' />
        </div>

        <div className='krad-splash-status'>
          <span className='krad-splash-pulse-dot' aria-hidden='true' />
          <span className='krad-splash-status-text'>Connecting to KRAD Chat...</span>
        </div>
      </div>
    </div>
  )
}

export default SpinnerComponent
