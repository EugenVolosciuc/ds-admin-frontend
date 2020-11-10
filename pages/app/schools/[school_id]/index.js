import React from 'react'

import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'
import { withAuth } from 'utils/hoc/withAuth'

const SchoolPage = () => {
    return (
        <DashboardLayout title="School name">
            <p>School dashboard</p>
        </DashboardLayout>
    )
}

export default withAuth(SchoolPage)