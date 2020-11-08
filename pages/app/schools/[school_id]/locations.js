import React, { useState, useContext } from 'react'
import { Modal, Button, Table, message } from 'antd'
import useSWR from 'swr'

import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'
import { withAuth } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'
import fetcher from 'utils/functions/fetcher'
import { authContext } from 'utils/hoc/withAuth'

const LocationsPage = () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(15)
    const [sortBy, setSortBy] = useState({})

    const { user, userLoading } = useContext(authContext)

    const url = '/locations'

    const { data, error, isValidating, mutate } = useSWR([url, page, perPage, sortBy], () => fetcher(url, {
        filters: { 
            school: user.school._id
        },
        sortBy,
        page,
        perPage
    }))

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

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
            sorter: true
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            sorter: true
        }
    ]

    return (
        <DashboardLayout title="Locations">
            <Table
                rowKey="_id"
                loading={isValidating}
                columns={columns}
                dataSource={data?.locations}
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
    LocationsPage,
    [
        USER_ROLES.SUPER_ADMIN.tag,
        USER_ROLES.SCHOOL_ADMIN.tag,
        USER_ROLES.LOCATION_ADMIN.tag
    ]
)