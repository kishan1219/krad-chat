import React, { useContext, useEffect, useState } from 'react'
import { AbilityContext } from '@src/utility/context/Can'
import { isValid } from './helpers/common'

export const Can = (p) => {
    const ability = useContext(AbilityContext)
    return ability.can(p?.action, p?.resource)
}

const Show = ({ IF = false, children = null }) => {

    const ability = useContext(AbilityContext)
    const [per, setPer] = useState(null)
    const [g, setG] = useState(null)
    const [type, setType] = useState("boolean")

    const setPermissions = (permissions) => {
        if (permissions !== null) {
            if (typeof permissions === "object") {
                setType("object")
                if (permissions?.hasOwnProperty("action") && permissions?.hasOwnProperty("resource")) {
                    setPer(permissions?.action)
                    setG(permissions?.resource)
                }
            }
        }
    }

    useEffect(() => {
        setPermissions(IF)
    }, [IF])


    if (type === "object") {
        if (ability.can(per, g)) {
            return isValid(children) ? children : true
        } else {
            return isValid(children) ? null : false
        }
    } else {
        if (IF) {
            return isValid(children) ? children : true
        } else {
            return isValid(children) ? null : false
        }
    }
}

export default Show
