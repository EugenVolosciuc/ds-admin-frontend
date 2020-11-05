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
import fetcher from 'utils/functions/fetcher'
import CreateEditUserModal from 'components/modals/CreateEditUserModal'
import { authContext } from 'utils/hoc/withAuth'

const StudentsPage = () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(15)
    const [sortBy, setSortBy] = useState({})
    const [showCreateUserModal, setShowCreateUserModal] = useState(false)
    const [showUpdateUserModal, setShowUpdateUserModal] = useState(null)

    const { user, userLoading } = useContext(authContext)

    const url = '/users'

    const { data, error, isValidating, mutate } = useSWR([url, page, perPage, sortBy], () => fetcher(url, {
        filters: {
            school: user.school,
            role: USER_ROLES.STUDENT.tag
        },
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
        // TODO: add location
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            sorter: true,
            render: text => <span>{USER_ROLES[text].label}</span>
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
            Register student
        </Button>
    )

    return (
        <DashboardLayout title="Students" pageHeaderExtra={pageHeaderExtra}>
            {/* Create User Modal */}
            <CreateEditUserModal
                visible={showCreateUserModal}
                onCancel={toggleCreateUserModal}
                userRole={USER_ROLES.STUDENT}
            />
            {/* Update User Modal */}
            {!isNull(showUpdateUserModal) &&
                <CreateEditUserModal
                    visible={showUpdateUserModal}
                    onCancel={toggleUpdateUserModal}
                    user={data?.users.find(user => user._id === showUpdateUserModal)}
                    userRole={USER_ROLES.STUDENT}
                />
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
    StudentsPage,
    [
        USER_ROLES.SUPER_ADMIN.tag,
        USER_ROLES.SCHOOL_ADMIN.tag,
        USER_ROLES.LOCATION_ADMIN.tag
    ]
)