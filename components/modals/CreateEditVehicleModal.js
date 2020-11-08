import React, { useState, useContext } from 'react'
import { Modal, Form, Input, Select, Row, Col, DatePicker, Button, Tooltip, Popconfirm, Spin, AutoComplete, message } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import axios from 'axios'
import moment from 'moment'

import TRANSMISSION_TYPES from 'constants/TRANSMISSION_TYPES'
import VEHICLE_STATUSES from 'constants/VEHICLE_STATUSES'
import VEHICLE_CATEGORIES from 'constants/VEHICLE_CATEGORIES'
import { authContext } from 'utils/hoc/withAuth'
import handleLocationSearch from 'utils/functions/searches/handleLocationSearch'
import handleInstructorSearch from 'utils/functions/searches/handleInstructorSearch'
import handleSelectInstructor from 'utils/functions/selectors/handleSelectInstructor'
import handleSelectLocation from 'utils/functions/selectors/handleSelectLocation'

const CreateEditVehicleModal = ({ visible, onCancel, vehicle }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [locationOptions, setLocationOptions] = useState({ locationNames: [], locationNamesandIDs: [] })
    const [instructorOptions, setInstructorOptions] = useState({ instructorNames: [], instructorNamesandIDs: [] })
    const isUpdateModal = !!vehicle

    const [form] = Form.useForm()

    const auth = useContext(authContext)

    const getDataToSend = values => {
        const { brand, category, instructorID, licensePlate, locationID, model, modelYear, transmission } = values

        return {
            brand,
            category,
            instructor: instructorID,
            licensePlate,
            location: locationID,
            model,
            transmission,
            modelYear: moment(modelYear).format('YYYY')
        }
    }

    const handleCreateVehicle = async values => {
        setIsLoading('register')
        try {
            await axios.post('/vehicles', getDataToSend(values))
            setIsLoading(false)
            onCancel()
            message.success('Vehicle registered')
            await mutate('/vehicles', data => ({ ...data, values }), true) // TODO: not working!
        } catch (error) {
            setIsLoading(false)
            console.log("Error registering vehicle", error)
        }
    }

    const handleUpdateVehicle = async values => {
        setIsLoading('update')
        try {
            await axios.patch(`/vehicles/${vehicle._id}`, getDataToSend(values))
            setIsLoading(false)
            onCancel()
            message.success('Vehicle modified')
            await mutate('/vehicles', data => ({ ...data, values }), true) // TODO: not working!
        } catch (error) {
            setIsLoading(false)
            console.log("Error modifying vehicle", error)
        }
    }

    const handleOutOfUseVehicle = async () => {
        setIsLoading('out of use')
        try {
            await axios.patch(`/vehicles/${vehicle._id}`, { status: VEHICLE_STATUSES.INOPERATIVE.tag})
            setIsLoading(false)
            onCancel()
            message.success('Vehicle set out of use')
        } catch (error) {
            setIsLoading(false)
            console.log("Error modifying vehicle", error)
        }
    }

    const initialValues = vehicle ? {
        brand: vehicle.brand,
        model: vehicle.model,
        modelYear: moment(vehicle.modelYear),
        licensePlate: vehicle.licensePlate,
        category: vehicle.category,
        ...(vehicle.transmission && { transmission: vehicle.transmission }),
        ...(vehicle.location && {
            location: vehicle.location.name,
            locationID: vehicle.location._id
        }),
        ...(vehicle.instructor && {
            instructor: `${vehicle.instructor.firstName} ${vehicle.instructor.lastName}`,
            instructorID: vehicle.instructor._id
        }),
    } : {}

    const modalTitle = isUpdateModal ? 'Update vehicle' : 'Register vehicle'
    const canPutOutOfUse = isUpdateModal && vehicle.status !== VEHICLE_STATUSES.INOPERATIVE.tag
    const modalFooter = (
        <Row justify={canPutOutOfUse ? "space-between" : "end"}>
            {canPutOutOfUse &&
                <Col span={12}>
                    <Row align="middle" justify="start">
                        <Popconfirm title="Are you sure you want to put this vehicle out of use?" onConfirm={handleOutOfUseVehicle} okButtonProps={{ danger: true }}>
                            <Button danger loading={isLoading === 'out of use'}>Out of use</Button>
                        </Popconfirm>
                        <Tooltip title="Out of use vehicles will not be selectable for further lessons, the lessons that are already scheduled will be canceled.">
                            <InfoCircleOutlined style={{ marginLeft: 8 }} />
                        </Tooltip>
                    </Row>
                </Col>
            }
            <Col span={12}>
                <Button onClick={() => onCancel()}>Cancel</Button>
                <Button
                    onClick={() => form.validateFields().then(values => isUpdateModal ? handleUpdateVehicle(values) : handleCreateVehicle(values))}
                    loading={isLoading === 'register' || isLoading === 'update'}
                    type="primary"
                >
                    {modalTitle}
                </Button>
            </Col>
        </Row>
    )

    return (
        <Modal
            destroyOnClose
            visible={visible}
            title={<span className="bold">{modalTitle}</span>}
            onCancel={() => onCancel()}
            footer={modalFooter}
        >
            <Form
                form={form}
                layout="vertical"
                name="vehicleForm"
                initialValues={initialValues}
            >
                <Row>
                    <Col span={11}>
                        <Form.Item name="brand" label="Brand" rules={[{ required: true, message: "Brand is required" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                        <Form.Item name="model" label="Model" rules={[{ required: true, message: "Model is required" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <Form.Item name="modelYear" label="Model Year" rules={[{ required: true, message: "Model year is required" }]}>
                            <DatePicker picker="year" className="w-full" disabledDate={current => current && current > moment()} placeholder="" />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                        <Form.Item name="licensePlate" label="License plate" rules={[{ required: true, message: "License plate is required" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <Form.Item name="category" label="Category">
                            <Select>
                                {Object.values(VEHICLE_CATEGORIES).map(category => (
                                    <Select.Option value={category.tag} key={category.tag}>
                                        {category.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                        <Form.Item name="transmission" label="Transmission">
                            <Select>
                                {Object.values(TRANSMISSION_TYPES).map(transmissionType => (
                                    <Select.Option value={transmissionType.tag} key={transmissionType.tag}>
                                        {transmissionType.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <Form.Item name="location" label="Location">
                            <AutoComplete
                                options={locationOptions.locationNames}
                                onSearch={value => handleLocationSearch(value, setIsLoading, auth, setLocationOptions)}
                                onSelect={selectedLocation => handleSelectLocation(selectedLocation, locationOptions, form)}>
                                <Input.Search loading={isLoading === 'locations'} />
                            </AutoComplete>
                        </Form.Item>
                        <Form.Item
                            hidden
                            name="locationID"
                        >
                            <Input hidden />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                        <Form.Item name="instructor" label="Instructor">
                            <AutoComplete
                                options={instructorOptions.instructorNames}
                                onSearch={value => handleInstructorSearch(value, setIsLoading, auth, setInstructorOptions)}
                                onSelect={selectedInstructor => handleSelectInstructor(selectedInstructor, instructorOptions, form)}>
                                <Input.Search loading={isLoading === 'instructors'} />
                            </AutoComplete>
                        </Form.Item>
                        <Form.Item
                            hidden
                            name="instructorID"
                        >
                            <Input hidden />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default CreateEditVehicleModal
