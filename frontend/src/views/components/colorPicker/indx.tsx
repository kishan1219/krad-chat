// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import { isValid } from '../../../utility/helpers/common'


const ColorPicker = ({ className = "", onChange = () => { }, color = null }) => {

    const [colorHex, setColor] = useState('#000000')
    const [displayColorPicker, setDisplayColorPicker] = useState(false)

    const handleClick = () => {
        setDisplayColorPicker(!displayColorPicker)
    }

    const handleClose = () => {
        setDisplayColorPicker(false)
    }

    const handleChange = (color) => {
        setColor(color.hex)
        onChange(color.hex)
    }

    useEffect(() => {
        if (isValid(color)) {
            setColor(color)
        } else {
            setColor('#000000')
        }
    }, [color])

    const styles = reactCSS({
        default: {
            color: {
                height: '28px',
                borderRadius: '2px',
                background: colorHex
            },
            swatch: {
                padding: '5px',
                background: '#fff',
                borderRadius: '1px',
                boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                display: 'block',
                cursor: 'pointer'
            },
            popover: {
                position: 'absolute',
                zIndex: '20'
            },
            cover: {
                position: 'fixed',
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        }
    })

    return (
        <div className={`flex-1 color-picker' + " " + ${className}`} >
            <div style={styles.swatch} onClick={handleClick}>
                <div style={styles.color} />
            </div>
            {displayColorPicker ? <div style={styles.popover}>
                <div style={styles.cover} onClick={handleClose} />
                <SketchPicker disableAlpha color={colorHex} presetColors={[]} onChange={handleChange} />
            </div> : null}

        </ div>
    )
}

export default ColorPicker
