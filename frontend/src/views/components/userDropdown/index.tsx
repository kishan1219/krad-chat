import { loadUser } from '../../../utility/apis/userManagement'
import { createAsyncSelectOptions } from '../../../utility/Utils'

type UserDropdownParams = {
    search?: string
    page?: number
    user_type_id?: number | string | null
}

const UserDropdown = async ({ search = '', page = 1, user_type_id = null }: UserDropdownParams) => {
    const res = await loadUser({
        async: true,
        page,
        perPage: 100,
        jsonData: { name: search, user_type_id }
    } as any)

    return createAsyncSelectOptions(res, page, 'name', 'id')
}

export default UserDropdown
