// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { isValid } from '../helpers/common'

const useOtp = () => {
    const otp = useSelector(state => state.auth?.otp)

    const [o, setO] = useState(null)

    useEffect(() => {
        if (isValid(otp)) {
            setO(otp)
        }
    }, [otp])

    return o
}

export default useOtp
