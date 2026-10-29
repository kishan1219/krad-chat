// @ts-nocheck
import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
  Editor as DraftEditor,
  EditorState,
  Modifier,
  RichUtils
} from 'draft-js'
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from 'react-feather'
import { Map } from 'immutable'

const INLINE_STYLES = [
  { icon: Bold, label: 'Bold', style: 'BOLD' },
  { icon: Italic, label: 'Italic', style: 'ITALIC' },
  { icon: Underline, label: 'Underline', style: 'UNDERLINE' },
  { icon: null, label: 'Strike', style: 'STRIKETHROUGH' }
]

const ALIGNMENTS = [
  { icon: AlignLeft, label: 'Align left', value: 'left' },
  { icon: AlignCenter, label: 'Align center', value: 'center' },
  { icon: AlignRight, label: 'Align right', value: 'right' }
]

const getAlignment = editorState => {
  const selection = editorState.getSelection()
  const content = editorState.getCurrentContent()
  const block = content.getBlockForKey(selection.getStartKey())

  return block?.getData()?.get('text-align') || 'left'
}

const setAlignment = (editorState, alignment) => {
  const content = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const nextContent = Modifier.setBlockData(content, selection, Map({ 'text-align': alignment }))

  return EditorState.push(editorState, nextContent, 'change-block-data')
}

const blockStyleFn = block => {
  const alignment = block.getData()?.get('text-align')

  return alignment ? `rdw-block-align-${alignment}` : ''
}

const WysiwygEditor = ({
  editorState,
  onEditorStateChange,
  placeholder,
  toolbarClassName,
  wrapperClassName,
  editorClassName,
  toolbar
}) => {
  const isControlled = editorState !== undefined
  const [internalState, setInternalState] = useState(() => editorState || EditorState.createEmpty())

  useEffect(() => {
    if (isControlled) {
      setInternalState(editorState || EditorState.createEmpty())
    }
  }, [editorState, isControlled])

  const currentState = isControlled ? editorState || EditorState.createEmpty() : internalState
  const inlineOptions = toolbar?.inline?.options || ['bold', 'italic', 'underline', 'strikethrough']
  const enabledOptions = toolbar?.options || ['inline', 'textAlign']

  const visibleInlineStyles = useMemo(() => {
    return INLINE_STYLES.filter(item => {
      return inlineOptions.includes(item.style.toLowerCase()) || inlineOptions.includes(item.style)
    })
  }, [inlineOptions])

  const updateState = nextState => {
    if (!isControlled) {
      setInternalState(nextState)
    }
    onEditorStateChange?.(nextState)
  }

  const handleInlineToggle = style => {
    updateState(RichUtils.toggleInlineStyle(currentState, style))
  }

  const handleAlignment = alignment => {
    updateState(setAlignment(currentState, alignment))
  }

  const currentInlineStyles = currentState.getCurrentInlineStyle()
  const currentAlignment = getAlignment(currentState)

  return (
    <div className={classNames('rdw-editor-wrapper', wrapperClassName)}>
      {enabledOptions.length > 0 ? (
        <div className={classNames('rdw-editor-toolbar', toolbarClassName)}>
          {enabledOptions.includes('inline') && visibleInlineStyles.map(({ icon: Icon, label, style }) => (
              <button
                key={style}
                type='button'
                className={classNames('rdw-option-wrapper', {
                  'rdw-option-active': currentInlineStyles.has(style)
                })}
                aria-label={label}
                title={label}
                onMouseDown={event => {
                  event.preventDefault()
                  handleInlineToggle(style)
                }}
              >
                {Icon ? <Icon size={16} /> : <span style={{ fontSize: 12, fontWeight: 600 }}>S</span>}
              </button>
            ))}
          {enabledOptions.includes('textAlign') && ALIGNMENTS.map(({ icon: Icon, label, value }) => (
              <button
                key={value}
                type='button'
                className={classNames('rdw-option-wrapper', {
                  'rdw-option-active': currentAlignment === value
                })}
                aria-label={label}
                title={label}
                onMouseDown={event => {
                  event.preventDefault()
                  handleAlignment(value)
                }}
              >
                <Icon size={16} />
              </button>
            ))}
        </div>
      ) : null}
      <div className={classNames('rdw-editor-main', editorClassName)}>
        <DraftEditor
          editorState={currentState}
          onChange={updateState}
          placeholder={placeholder}
          blockStyleFn={blockStyleFn}
        />
      </div>
    </div>
  )
}

WysiwygEditor.propTypes = {
  editorClassName: PropTypes.string,
  editorState: PropTypes.object,
  onEditorStateChange: PropTypes.func,
  placeholder: PropTypes.string,
  toolbar: PropTypes.object,
  toolbarClassName: PropTypes.string,
  wrapperClassName: PropTypes.string
}

export { WysiwygEditor as Editor }
