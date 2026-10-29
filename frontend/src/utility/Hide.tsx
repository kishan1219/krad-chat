import React, { useContext, useEffect, useState } from 'react'
import { AbilityContext } from '@src/utility/context/Can'

const Hide = ({ IF, children, permission = null, group = null }) => {
    const [per, setPer] = useState(null)
    const [g, setG] = useState(null)
    const ability = useContext(AbilityContext)

    useEffect(() => {
        setPer(permission)
        setG(group)
    }, [permission, group])

    if (permission && group) {
        if (ability.can(per, g)) {
            return null
        } else {
            return children
        }
    } else {
        if (IF) {
            return null
        } else {
            return children
        }
    }
}

export default Hide
