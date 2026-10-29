// @ts-nocheck
import { cloneElement, isValidElement } from 'react'

const writeToClipboard = async text => {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'absolute'
  textArea.style.left = '-9999px'
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}

export const CopyToClipboard = ({ text = '', onCopy = () => {}, children }) => {
  const handleClick = async event => {
    event?.preventDefault?.()

    try {
      await writeToClipboard(text)
      onCopy(text)
    } catch (error) {
      console.error('Copy failed', error)
    }
  }

  if (!isValidElement(children)) {
    return null
  }

  return cloneElement(children, {
    ...children.props,
    onClick: event => {
      children.props?.onClick?.(event)
      handleClick(event)
    }
  })
}

export default CopyToClipboard
