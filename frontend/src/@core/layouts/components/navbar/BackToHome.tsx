// @ts-nocheck
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Badge } from 'reactstrap'
import { handleLogin } from '../../../../redux/authentication'
import { childLogin } from '../../../../utility/apis/userManagement'
import { isValid, log } from '../../../../utility/helpers/common'
import useUser from '../../../../utility/hooks/useUser'
import Show from '../../../../utility/Show'
import { AbilityContext } from '@src/utility/context/Can'

const extraPermissions = [
    {
        action: 'dashboard-view',
        subject: 'all'
    },
    {
        action: 'private-view',
        subject: 'all'
    }
]

const BackToHome = () => {
    const userLogin = useSelector(state => state.auth.userData)
    const userT = useUser()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const ability = useContext(AbilityContext)

    const refreshPage = () => {
        // window.location.href = window.location.href
        window.location.assign("admin-send-sms")
        navigate("/admin-send-sms")
        
    }
    // const childLoginButton = () => {
    //     // const encoded = base64.encode(row?.uuid)
    //     childLogin({
    //         jsonData: {
    //             ...userT,
    //             account_uuid: userLogin?.parent_key,
    //             is_back_to_self_account : 1
    //         },
    //         success: (d) => {
    //             const x = {
    //                 ...userT,
    //                 ...d
    //                 // 
    //                 // refreshPage
                   
    //             }
            
    //             // window.location.reload()
    //             dispatch(handleLogin(x))
    //             refreshPage()
    //             navigate("/dashboard")

    //         }
    //     })
    // }

    const childLoginButton = (row) => {
        // const encoded = base64.encode(row?.uuid)
        childLogin({
            jsonData: {
                ...userT,
                account_uuid: userLogin?.parent_key,
                is_back_to_self_account : 1
            },
            success: (data) => {
                const p = data?.data?.permissions?.map(a => ({
                    action: a.name,
                    subject: "all"
                })) ?? []
                const m = {
                    ...data.data,
                    // role: data.payload.roles,
                    ability: p?.concat(extraPermissions)
                }
// log(m, "awsdDDDDDDDDDDDDDD")
                dispatch(handleLogin(m))
                if (data?.data?.permissions) ability.update(m?.ability)
                // if (redirect) navigate('/dashboard')
                refreshPage()
            }
        })
    }
  return (
   <>
   <Show IF = {isValid(userLogin?.parent_key)}>
   <Badge color='danger' onClick={() => childLoginButton()} style= {{ cursor: "pointer"}}>
    Back To Home
   </Badge>
   </Show>
   </>
  )
}

export default BackToHome
