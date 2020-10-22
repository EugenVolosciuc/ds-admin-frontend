import React, { useState, useContext } from 'react'
import { Modal, Button, Table, message } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import useSWR from 'swr'
import isNull from 'lodash/isNull'
import axios from 'axios'
import dayjs from 'dayjs'

import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'
import { withAuth } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'
import TRANSMISSION_TYPES from 'constants/TRANSMISSION_TYPES'
import VEHICLE_STATUSES from 'constants/VEHICLE_STATUSES'
import fetcher from 'utils/functions/fetcher'
import CreateEditUserModal from 'components/modals/CreateEditUserModal'
import { authContext } from 'utils/hoc/withAuth'

const VehiclesPage = () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(15)
    const [sortBy, setSortBy] = useState({})

    const { user, userLoading } = useContext(authContext)

    const url = '/vehicles'

    const { data, error, isValidating, mutate } = useSWR([url, page, perPage, sortBy], () => fetcher(url, {
        filters: { 
            school: user.school
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
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            sorter: true
        },
        {
            title: 'Model',
            dataIndex: 'model',
            key: 'model',
            sorter: true
        },
        {
            title: 'Production year',
            dataIndex: 'modelYear',
            key: 'modelYear',
            sorter: true,
            render: modelYear => dayjs(modelYear).format('YYYY')
        },
        {
            title: 'License plate',
            dataIndex: 'licensePlate',
            key: 'licensePlate',
            sorter: true
        },
        {
            title: 'School location',
            dataIndex: 'schoolLocation',
            key: 'schoolLocation',
            sorter: true,
            render: schoolLocation => <span>{schoolLocation ? schoolLocation : '-'}</span>
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            sorter: true
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            render: status => VEHICLE_STATUSES[status].label
        },
        {
            title: 'Transmission',
            dataIndex: 'transmission',
            key: 'transmission',
            sorter: true,
            render: transmission => <span>{transmission ? TRANSMISSION_TYPES[transmission].label : '-'}</span>
        },
        // {
        //     title: 'Email',
        //     dataIndex: 'email',
        //     key: 'email',
        //     sorter: true,
        //     render: email => <span>{email ? email : '-'}</span>
        // },
        // {
        //     title: 'Phone number',
        //     dataIndex: 'phoneNumber',
        //     key: 'phoneNumber',
        //     sorter: true
        // },
        // // TODO: add location
        // {
        //     title: 'Role',
        //     dataIndex: 'role',
        //     key: 'role',
        //     sorter: true,
        //     render: text => <span>{USER_ROLES[text].label}</span>
        // },
        // {
        //     title: 'Created at',
        //     dataIndex: 'createdAt',
        //     key: 'createdAt',
        //     sorter: true,
        //     render: time => dayjs(time).format('HH:mm DD-MM-YYYY')
        // }
    ]

    return (
        <DashboardLayout title="Vehicles">
            <Table
                rowKey="_id"
                loading={isValidating}
                columns={columns}
                dataSource={data?.vehicles}
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
    VehiclesPage,
    [
        USER_ROLES.SUPER_ADMIN.tag,
        USER_ROLES.SCHOOL_ADMIN.tag,
        USER_ROLES.LOCATION_ADMIN.tag
    ]
)