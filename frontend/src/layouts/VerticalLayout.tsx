// ** React Imports
import { Outlet } from 'react-router-dom'

// ** Core Layout Import
// !Do not remove the Layout import
import Layout from '@layouts/VerticalLayout'

// ** Menu Items Array
import navigation from '@src/navigation/vertical'
import { useEffect, useState } from 'react'
import Emitter from '../utility/Emitter'
import { Events } from '../utility/Const'
import { isValid, log } from '../utility/helpers/common'

const VerticalLayout = props => {
    const [unauthenticated, setUnauthenticated] = useState(null)

    // const [menuData, setMenuData] = useState([])

    // ** For ServerSide navigation
    // useEffect(() => {
    //   axios.get(URL).then(response => setMenuData(response.data))
    // }, [])
    useEffect(() => {
        Emitter.on(Events.Unauthenticated, setUnauthenticated)
    }, [])

    useEffect(() => {
        if (isValid(unauthenticated)) {
            // log(unauthenticated, "unauthenticated")
            if (unauthenticated) {
                window.location.href = '/authentication'
                // document.body.classList.add("no-scroll")
            } else {
                // document.body.classList.remove("no-scroll")
            }
        }
    }, [unauthenticated])
    return (
        <Layout menuData={navigation} {...props}>
            <Outlet />
        </Layout>
    )
}

export default VerticalLayout
