import { useEffect, useState } from 'react'

import { useAppSelector } from '../../redux/hooks'
import { isValid } from '../helpers/common'

type UserRecord = Record<string, unknown> | null

const useUser = (): UserRecord => {
    const user = useAppSelector(state => (state.auth?.userData as UserRecord) ?? null)
    const [currentUser, setCurrentUser] = useState<UserRecord>(null)

    useEffect(() => {
        if (isValid(user)) {
            setCurrentUser(user)
        }
    }, [user])

    return currentUser
}

export default useUser
