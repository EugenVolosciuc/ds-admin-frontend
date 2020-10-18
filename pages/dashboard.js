import React from 'react'

import { withAuth } from 'utils/hoc/withAuth'
import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'

const Dashboard = () => {

    return (
        <DashboardLayout>
            <div>
                <p>This page should be auth only</p>
            </div>
        </DashboardLayout>
    )
}

export default withAuth(Dashboard)
