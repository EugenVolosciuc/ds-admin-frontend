import React, { useContext } from 'react'

import { authContext } from 'utils/hoc/withAuth'
import SuperAdminMenu from 'components/menus/SuperAdminMenu'
import SchoolAdminMenu from 'components/menus/SchoolAdminMenu'
import USER_ROLES from 'constants/USER_ROLES'

const MainMenu = () => {
    const { user } = useContext(authContext)

    const renderMenu = () => {
        switch (user.role) {
            case USER_ROLES.SUPER_ADMIN.tag:
                return <SuperAdminMenu />
            case USER_ROLES.SCHOOL_ADMIN.tag:
                return <SchoolAdminMenu />
            default:
                return null
        }
    }

    return renderMenu()
}

export default MainMenu