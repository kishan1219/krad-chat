import { useEffect } from 'react'

/**
 * Dynamic Favicon Notification Badge Utility
 * Dynamically overlays an unread count badge onto the SVG/PNG favicon
 * and synchronizes document.title for background browser tabs.
 */

let originalFaviconHref: string | null = null
let originalDocumentTitle: string | null = null
let baseFaviconImage: HTMLImageElement | null = null

/**
 * Preload the base icon image for fast badge drawing
 */
const getBaseFaviconImage = (): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (baseFaviconImage && baseFaviconImage.complete) {
      resolve(baseFaviconImage)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    // Fallback order: favicon-32.png -> favicon.svg
    img.src = '/favicon-32.png'
    img.onload = () => {
      baseFaviconImage = img
      resolve(img)
    }
    img.onerror = () => {
      // Fallback to SVG if PNG fails
      const fallbackImg = new Image()
      fallbackImg.crossOrigin = 'anonymous'
      fallbackImg.src = '/favicon.svg'
      fallbackImg.onload = () => {
        baseFaviconImage = fallbackImg
        resolve(fallbackImg)
      }
      fallbackImg.onerror = reject
    }
  })
}

/**
 * Finds or creates the primary <link rel="icon"> in document.head
 */
const getFaviconElement = (): HTMLLinkElement | null => {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  return link
}

/**
 * Dynamically update the browser tab favicon and title with an unread badge
 * @param count Number of unread messages (0 to clear)
 */
export const setFaviconBadge = async (count: number): Promise<void> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const link = getFaviconElement()
  if (!link) return

  // Cache initial favicon and title on first call
  if (!originalFaviconHref) {
    originalFaviconHref = link.getAttribute('href') || '/favicon.svg'
  }
  if (!originalDocumentTitle) {
    originalDocumentTitle = document.title
  }

  // Clear badge when count is 0 or negative
  if (count <= 0) {
    if (originalFaviconHref) {
      link.href = originalFaviconHref
    }
    if (originalDocumentTitle) {
      // Strip any existing badge prefix
      document.title = originalDocumentTitle.replace(/^\(\d+\+?\)\s*/, '')
    }
    return
  }

  // Format count label: e.g. "1", "9", "9+"
  const label = count > 9 ? '9+' : String(count)

  // Update tab title with badge count
  const cleanTitle = (originalDocumentTitle || document.title).replace(/^\(\d+\+?\)\s*/, '')
  document.title = `(${label}) ${cleanTitle}`

  try {
    const baseImg = await getBaseFaviconImage()

    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // 1. Draw base icon
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(baseImg, 0, 0, size, size)

    // 2. Draw badge container (red circular pill)
    const badgeRadius = label.length > 1 ? 8.5 : 7.5
    const badgeX = size - badgeRadius - 0.5
    const badgeY = badgeRadius + 0.5

    // Outer dark contrast stroke
    ctx.beginPath()
    ctx.arc(badgeX, badgeY, badgeRadius + 1.2, 0, 2 * Math.PI)
    ctx.fillStyle = '#060d1f'
    ctx.fill()

    // Vibrant Red / WhatsApp notification pill
    ctx.beginPath()
    ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI)
    ctx.fillStyle = '#EF4444'
    ctx.fill()

    // Inner subtle glow/gradient
    ctx.beginPath()
    ctx.arc(badgeX - 1.5, badgeY - 1.5, badgeRadius * 0.45, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.fill()

    // 3. Draw badge text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${label.length > 1 ? 9.5 : 10.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, badgeX, badgeY + 0.5)

    // 4. Set as dynamic favicon
    link.href = canvas.toDataURL('image/png')
  } catch (error) {
    console.warn('[FaviconBadge] Unable to generate dynamic badge:', error)
  }
}

/**
 * React Hook for automated favicon unread badging
 */
export const useFaviconBadge = (unreadCount: number): void => {
  useEffect(() => {
    setFaviconBadge(unreadCount)

    // Cleanup on unmount
    return () => {
      setFaviconBadge(0)
    }
  }, [unreadCount])
}

export default setFaviconBadge
