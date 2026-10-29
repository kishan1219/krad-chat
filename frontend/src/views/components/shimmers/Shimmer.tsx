// @ts-nocheck
import React from 'react'

const Shimmer = (props) => {
    let styles = {}
    styles.height = props.height
    if (props.width) {
        styles.width = props.width
    }
    if (props.style) {
        styles = { ...styles, ...props.style }
        // cLog(props.style)
    }
    return (
        <div style={styles} className={`animated-background ${props?.className}`}> </div>
    )
}

export default Shimmer
