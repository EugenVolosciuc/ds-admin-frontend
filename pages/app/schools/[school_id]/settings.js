import React from 'react'

import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'
import { withAuth } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'
import SchoolSettings from 'components/settings/SchoolSettings'

const SchoolSettingsPage = () => {
    return (
        <DashboardLayout title="School settings">
            <SchoolSettings />
        </DashboardLayout>
    )
}

export default withAuth(SchoolSettingsPage, [USER_ROLES.SCHOOL_ADMIN.tag])