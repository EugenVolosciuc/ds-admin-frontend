import React, { useState } from 'react'
import { Table } from 'antd'
import useSWR from 'swr'

import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'
import { withAuth } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'
import fetcher from 'utils/functions/fetcher'

const SchoolsPage = () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(15)

    const url = '/schools'

    const { data, error, isValidating } = useSWR([url, page, perPage], () => fetcher(url, {
        filters: {},
        page,
        perPage
    }))

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country'
        },
        {
            title: 'Admin',
            dataIndex: 'admin',
            key: 'admin',
            render: admin => <span>{admin?.firstName} {admin?.lastName}</span>
        },
    ]

    return (
        <DashboardLayout>
            <Table
                rowKey="_id"
                loading={isValidating}
                columns={columns}
                dataSource={data?.schools}
            />
        </DashboardLayout>
    )
}

export default withAuth(
    SchoolsPage,
    USER_ROLES.SUPER_ADMIN.tag
)
