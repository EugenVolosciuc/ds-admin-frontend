import React, { useState } from 'react'
import { Table } from 'antd'
import useSWR from 'swr'

import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'
import { withAuth } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'
import fetcher from 'utils/functions/fetcher'

const UsersPage = () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(15)

    const url = '/users'

    const { data, error, isValidating } = useSWR([url, page, perPage], () => fetcher(url, {
        filters: {},
        page,
        perPage
    }))

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <span>{record.firstName} {record.lastName}</span>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Phone number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber'
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: text => <span>{USER_ROLES[text].label}</span>
        },
        {
            title: 'School',
            dataIndex: 'school',
            key: 'school',
            render: school => <span>{school?.name || '-'}</span>
        },
    ]

    return (
        <DashboardLayout>
            <Table
                rowKey="_id"
                loading={isValidating}
                columns={columns}
                dataSource={data?.users}
            />
        </DashboardLayout>
    )
}

export default withAuth(
    UsersPage,
    [
        USER_ROLES.SUPER_ADMIN.tag,
        USER_ROLES.SCHOOL_ADMIN.tag,
        USER_ROLES.LOCATION_ADMIN.tag
    ]
)
