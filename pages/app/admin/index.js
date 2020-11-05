import React from 'react'

import { withAuth } from 'utils/hoc/withAuth'
import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'

const Dashboard = () => {

    return (
        <DashboardLayout title="Dashboard">
            <div>
                <p>Super Admin Dashboard</p>
            </div>
        </DashboardLayout>
    )
}

export default withAuth(Dashboard)