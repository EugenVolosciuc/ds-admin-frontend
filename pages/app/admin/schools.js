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
    const [sortBy, setSortBy] = useState({})

    const url = '/schools'

    const { data, error, isValidating } = useSWR([url, page, perPage, sortBy], () => fetcher(url, {
        filters: {},
        sortBy,
        page,
        perPage
    }))

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            sorter: true
        },
        {
            title: 'Admin',
            dataIndex: 'admin',
            key: 'admin',
            render: admin => <span>{admin?.firstName ? `${admin.firstName} ${admin.lastName}` : '-'}</span>
        },
    ]

    const handleTableChange = (pagination, filters, sorter, extra) => {
        switch (extra.action) {
            case 'paginate':
                setPage(pagination.current)
                setPerPage(pagination.pageSize)
                break
            case 'sort':
                setSortBy(sorter.order ? { [sorter.field]: `${sorter.order}ing` } : {})
                setPage(1)
                break
            case 'filter':
                console.log("FILTERED")
        }
    }

    return (
        <DashboardLayout title="Schools">
            <Table
                rowKey="_id"
                loading={isValidating}
                columns={columns}
                dataSource={data?.schools}
                onChange={handleTableChange}
                pagination={{
                    pageSize: perPage,
                    current: page,
                    total: data?.totalItems,
                    pageSizeOptions: [15, 30, 45, 60]
                }}
            />
        </DashboardLayout>
    )
}

export default withAuth(
    SchoolsPage,
    USER_ROLES.SUPER_ADMIN.tag
)