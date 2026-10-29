// @ts-nocheck
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { waFlowSignup } from '../../utility/apis/userManagement'
import toast from 'react-hot-toast'

function FbCallback() {
    const location = useLocation()
    const [code, , setCode] = React.useState(null)

    useEffect(() => {

        const queryParams = new URLSearchParams(location.search)
        const someData = queryParams.get('code') // Replace 'someKey' with the actual key
        console.log('Post data:', someData)
        setCode(someData)
        // The returned code must be transmitted to your backend first and then
        // perform a server-to-server call from there to our servers for an access token.

        waFlowSignup({
            jsonData: {
                code: someData
            },
            success: (e) => {
                toast.success("Successfully connected to Facebook")
                // redirect to the app page
                // window.location.href = "/"
            }
        })
    }, [location])

    return null
}

export default FbCallback
