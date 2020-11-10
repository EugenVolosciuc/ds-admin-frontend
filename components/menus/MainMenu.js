import React, { useContext } from 'react'

import { authContext } from 'utils/hoc/withAuth'
import SuperAdminMenu from 'components/menus/SuperAdminMenu'
import SchoolAdminMenu from 'components/menus/SchoolAdminMenu'
import InstructorMenu from 'components/menus/InstructorMenu'
import StudentMenu from 'components/menus/StudentMenu'
import LocationAdminMenu from 'components/menus/LocationAdminMenu'
import USER_ROLES from 'constants/USER_ROLES'

const MainMenu = () => {
    const { user } = useContext(authContext)

    const renderMenu = () => {
        switch (user.role) {
            case USER_ROLES.SUPER_ADMIN.tag:
                return <SuperAdminMenu />
            case USER_ROLES.SCHOOL_ADMIN.tag:
                return <SchoolAdminMenu />
            case USER_ROLES.INSTRUCTOR.tag:
                return <InstructorMenu />
            case USER_ROLES.LOCATION_ADMIN.tag:
                return <LocationAdminMenu />
            case USER_ROLES.STUDENT.tag:
                return <StudentMenu />
            default:
                return null
        }
    }

    return renderMenu()
}

export default MainMenu
