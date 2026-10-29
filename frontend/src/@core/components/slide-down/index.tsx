// @ts-nocheck
import { forwardRef } from 'react'
import classNames from 'classnames'

export const SlideDown = forwardRef(({ children, className, ...rest }, ref) => (
  <div ref={ref} className={classNames('react-slidedown', className)} {...rest}>
    <div className='react-slidedown__wrapper'>
      <div className='react-slidedown__content'>{children}</div>
    </div>
  </div>
))

SlideDown.displayName = 'SlideDown'

export default SlideDown
