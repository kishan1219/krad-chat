import React from 'react'
import { useSelector } from 'react-redux'

// Pure Vector SVG Logos for infinite scalability & crispness
import kradTechDarkSvg from '@src/assets/images/logo/krad-technology-dark.svg'
import kradTechLightSvg from '@src/assets/images/logo/krad-technology-light.svg'
import kradTechCleanDarkSvg from '@src/assets/images/logo/krad-technology-clean-dark.svg'
import kradTechCleanLightSvg from '@src/assets/images/logo/krad-technology-clean-light.svg'
import kradIconSvg from '@src/assets/images/logo/krad-logo-icon.svg'

export interface KradLogoProps {
  /**
   * Theme mode:
   * - 'auto': Reads skin from Redux store (default)
   * - 'dark': Forces high-contrast metallic chrome & electric cyan
   * - 'light': Forces deep slate-navy & cyan
   */
  variant?: 'dark' | 'light' | 'auto'

  /**
   * Standardized component heights:
   * - 'xs': 22px (compact badges)
   * - 'sm': 28px (mobile headers)
   * - 'md': 36px (default desktop navbar)
   * - 'lg': 48px (dialogs / auth cards)
   * - 'hero': 68px (landing hero section)
   * - 'badge': 34px icon-only square
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero' | 'badge'

  /**
   * Include the official subtitle:
   * "CUSTOM SOFTWARE | AI SERVICES | MOBILE APPS | DIGITAL MARKETING"
   * Default is false (clean wordmark) for navbars & compact spaces.
   */
  showSubtitle?: boolean

  /** Optional custom CSS class */
  className?: string

  /** Optional inline styles */
  style?: React.CSSProperties

  /** Accessibility label */
  alt?: string
}

const SIZE_MAP: Record<NonNullable<KradLogoProps['size']>, number> = {
  xs: 22,
  sm: 28,
  md: 36,
  lg: 48,
  hero: 68,
  badge: 34
}

/**
 * Production-ready Vector Logo for KRAD Technology.
 * Delivers razor-sharp rendering on all screen densities (1x to 4x Retina)
 * with seamless light/dark theme synchronization.
 */
export const KradLogo: React.FC<KradLogoProps> = ({
  variant = 'auto',
  size = 'md',
  showSubtitle = false,
  className = '',
  style = {},
  alt = 'KRAD Technology - Enterprise WhatsApp Business Solutions'
}) => {
  const layoutSkin = useSelector((state: any) => state?.layout?.skin)

  // Resolve theme mode
  const isDark = variant === 'dark' || (variant === 'auto' && layoutSkin !== 'light')
  const heightPx = SIZE_MAP[size] || 36

  // Badge icon-only mode
  if (size === 'badge') {
    return (
      <img
        src={kradIconSvg}
        alt={alt}
        className={`krad-brand-mark ${className}`}
        style={{
          height: `${heightPx}px`,
          width: `${heightPx}px`,
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style
        }}
      />
    )
  }

  // Select corresponding pure SVG vector asset
  let activeSrc: string
  if (showSubtitle) {
    activeSrc = isDark ? kradTechDarkSvg : kradTechLightSvg
  } else {
    activeSrc = isDark ? kradTechCleanDarkSvg : kradTechCleanLightSvg
  }

  return (
    <div
      className={`krad-logo-wrap ${isDark ? 'krad-theme-dark' : 'krad-theme-light'} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
        transition: 'opacity 0.2s ease',
        ...style
      }}
    >
      <img
        src={activeSrc}
        alt={alt}
        style={{
          height: `${heightPx}px`,
          width: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  )
}

export default KradLogo
