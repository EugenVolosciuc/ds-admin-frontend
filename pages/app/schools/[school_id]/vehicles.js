import React, { useState, useContext } from 'react'
import { Modal, Button, Table, message } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import useSWR from 'swr'
import isNull from 'lodash/isNull'
import axios from 'axios'
import moment from 'moment'

import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'
import { withAuth } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'
import TRANSMISSION_TYPES from 'constants/TRANSMISSION_TYPES'
import VEHICLE_STATUSES from 'constants/VEHICLE_STATUSES'
import fetcher from 'utils/functions/fetcher'
import { authContext } from 'utils/hoc/withAuth'
import CreateEditVehicleModal from 'components/modals/CreateEditVehicleModal'

const VehiclesPage = () => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(15)
    const [sortBy, setSortBy] = useState({})
    const [showCreateVehicleModal, setShowCreateVehicleModal] = useState(false)
    const [showUpdateVehicleModal, setShowUpdateVehicleModal] = useState(null)

    const { user } = useContext(authContext)

    const url = '/vehicles'

    const { data, error, isValidating, mutate } = useSWR([url, page, perPage, sortBy], () => fetcher(url, {
        filters: {
            school: user.school
        },
        sortBy,
        page,
        perPage
    }))

    const toggleCreateVehicleModal = () => setShowCreateVehicleModal(!showCreateVehicleModal)

    const toggleUpdateVehicleModal = id => {
        if (id) return setShowUpdateVehicleModal(id)

        return setShowUpdateVehicleModal(null)
    }

    const handleDeleteVehicle = async id => {
        try {
            await axios.delete(`/vehicles/${id}`)
            message.success('Vehicle deleted')
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
            render: modelYear => moment(modelYear).format('YYYY')
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
            render: schoolLocation => <span>{schoolLocation ? schoolLocation.name : '-'}</span>
        },
        {
            title: 'Instructor',
            dataIndex: 'instructor',
            key: 'instructor',
            sorter: true,
            render: instructor => <span>{instructor ? `${instructor.firstName} ${instructor.lastName}` : '-'}</span>
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
        {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            render: (text, record) => {
                return <span>
                    <EditOutlined style={{ marginRight: 16 }} onClick={() => toggleUpdateVehicleModal(record._id)} />
                    <DeleteOutlined
                        className="text-error"
                        onClick={() => Modal.confirm({
                            okText: 'Yes',
                            cancelText: 'No',
                            okButtonProps: { danger: true },
                            onOk: () => handleDeleteVehicle(record._id),
                            content: <span>Are you sure you want to delete {record.brand} {record.model}?</span>
                        })}
                    />
                </span>
            }
        }
    ]

    const pageHeaderExtra = (
        <Button size="middle" type="primary" onClick={toggleCreateVehicleModal}>
            Register vehicle
        </Button>
    )

    return (
        <DashboardLayout title="Vehicles" pageHeaderExtra={pageHeaderExtra}>
            {/* Create Vehicle Modal */}
            <CreateEditVehicleModal visible={showCreateVehicleModal} onCancel={toggleCreateVehicleModal} />
            {/* Update Vehicle Modal */}
            {!isNull(showUpdateVehicleModal) &&
                <CreateEditVehicleModal visible={showUpdateVehicleModal} onCancel={toggleUpdateVehicleModal} vehicle={data?.vehicles.find(vehicle => vehicle._id === showUpdateVehicleModal)} />
            }
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