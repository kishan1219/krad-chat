// @ts-nocheck
import React, { useState } from 'react'
import './CustomTooltip.css' 

const CustomTooltip = ({ children, text }) => {
    const [visible, setVisible] = useState(false)

    return (
        <div
            className="tooltip-wrapper"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && <div className="tooltip-box">{text}</div>}
        </div>
    )
}

export default CustomTooltip
