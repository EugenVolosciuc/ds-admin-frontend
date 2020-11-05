import React, { useState } from 'react'
import { Modal, Button, Table, message } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import useSWR from 'swr'
import isNull from 'lodash/isNull'
import axios from 'axios'
import dayjs from 'dayjs'

import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'
import { withAuth } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'
import fetcher from 'utils/functions/fetcher'
import CreateEditUserModal from 'components/modals/CreateEditUserModal'

const UsersPage = () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(15)
    const [sortBy, setSortBy] = useState({})
    const [showCreateUserModal, setShowCreateUserModal] = useState(false)
    const [showUpdateUserModal, setShowUpdateUserModal] = useState(null)

    const url = '/users'

    const { data, error, isValidating, mutate } = useSWR([url, page, perPage, sortBy], () => fetcher(url, {
        filters: {},
        sortBy,
        page,
        perPage
    }))

    const toggleCreateUserModal = () => setShowCreateUserModal(!showCreateUserModal)

    const toggleUpdateUserModal = id => {
        if (id) return setShowUpdateUserModal(id)

        return setShowUpdateUserModal(null)
    }

    const handleDeleteUser = async id => {
        try {
            await axios.delete(`/users/${id}`)
            message.success('User deleted')
            await mutate('/users', data => ({ ...data, values }), true)
        } catch (error) {
            console.log("Error deleting user", error)
        }
    }

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
            dataIndex: 'lastName',
            key: 'lastName',
            sorter: true,
            render: (text, record) => (
                <span>{record.lastName} {record.firstName}</span>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: true,
            render: email => <span>{email ? email : '-'}</span>
        },
        {
            title: 'Phone number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            sorter: true
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            sorter: true,
            render: text => <span>{USER_ROLES[text].label}</span>
        },
        {
            title: 'School',
            dataIndex: 'school',
            key: 'school',
            sorter: true,
            render: school => <span>{school?.name || '-'}</span>
        },
        {
            title: 'Created at',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: time => dayjs(time).format('HH:mm DD-MM-YYYY')
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            render: (text, record) => {
                return <span>
                    <EditOutlined style={{ marginRight: 16 }} onClick={() => toggleUpdateUserModal(record._id)} />
                    <DeleteOutlined
                        className="text-error"
                        onClick={() => Modal.confirm({
                            okText: 'Yes',
                            cancelText: 'No',
                            okButtonProps: { danger: true },
                            onOk: () => handleDeleteUser(record._id),
                            content: <span>Are you sure you want to delete {record.firstName} {record.lastName}?</span>
                        })}
                    />
                </span>
            }
        }
    ]

    const pageHeaderExtra = (
        <Button size="middle" type="primary" onClick={toggleCreateUserModal}>
            Create User
        </Button>
    )

    return (
        <DashboardLayout title="Users" pageHeaderExtra={pageHeaderExtra}>
            {/* Create User Modal */}
            <CreateEditUserModal visible={showCreateUserModal} onCancel={toggleCreateUserModal} />
            {/* Update User Modal */}
            {!isNull(showUpdateUserModal) &&
                <CreateEditUserModal visible={showUpdateUserModal} onCancel={toggleUpdateUserModal} user={data?.users.find(user => user._id === showUpdateUserModal)} />
            }

            <Table
                rowKey="_id"
                loading={isValidating}
                columns={columns}
                dataSource={data?.users}
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
    UsersPage,
    [
        USER_ROLES.SUPER_ADMIN.tag,
        USER_ROLES.SCHOOL_ADMIN.tag,
        USER_ROLES.LOCATION_ADMIN.tag
    ]
)