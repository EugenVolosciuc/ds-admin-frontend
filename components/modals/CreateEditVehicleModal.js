import React, { useState, useContext } from 'react'
import { Modal, Form, Input, Select, Row, Col, DatePicker, Spin, AutoComplete, message } from 'antd'
import axios from 'axios'
import debounce from 'lodash/debounce'

import TRANSMISSION_TYPES from 'constants/TRANSMISSION_TYPES'
import VEHICLE_STATUSES from 'constants/VEHICLE_STATUSES'
import VEHICLE_CATEGORIES from 'constants/VEHICLE_CATEGORIES'
import { authContext } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'

const CreateEditVehicleModal = ({ visible, onCancel, vehicle }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [locationOptions, setLocationOptions] = useState({ locationNames: [], locationNamesandIDs: [] })
    const [instructorOptions, setInstructorOptions] = useState({ instructorNames: [], instructorNamesandIDs: [] })
    const isUpdateModal = !!vehicle

    const [form] = Form.useForm()

    const auth = useContext(authContext)

    const handleCreateVehicle = async values => {
        setIsLoading('create')
        try {
            await axios.post('/vehicles', values)
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
            await axios.patch(`/vehicles/${vehicle._id}`, values)
            setIsLoading(false)
            onCancel()
            message.success('Vehicle modified')
            await mutate('/vehicles', data => ({ ...data, values }), true) // TODO: not working!
        } catch (error) {
            setIsLoading(false)
            console.log("Error modifying vehicle", error)
        }
    }

    const handleLocationSearch = debounce(async value => {
        if (value.length > 2) {
            try {
                setIsLoading('locations')
                const { data } = await axios.get('/school-locations/search', {
                    params: {
                        search: {
                            name: value
                        },
                        school: auth.user.school
                    }
                })

                setLocationOptions({
                    locationNames: data.map(location => ({ value: location.name })),
                    locationNamesandIDs: data.map(location => ({ id: location._id, name: location.name }))
                })
            } catch (error) {
                console.log("Error searching for locations", error)
            }

            setIsLoading(false)
        }
    }, 500)

    const handleInstructorSearch = debounce(async value => {
        if (value.length > 2) {
            try {
                setIsLoading('instructors')
                const { data } = await axios.get('/users/search', {
                    params: {
                        search: {
                            lastName: value
                        },
                        school: auth.user.school,
                        role: USER_ROLES.INSTRUCTOR.tag
                    }
                })

                setInstructorOptions({
                    instructorNames: data.map(instructor => ({ value: instructor.name })),
                    instructorNamesandIDs: data.map(instructor => ({ id: instructor._id, name: instructor.name }))
                })
            } catch (error) {
                console.log("Error searching for instructors", error)
            }

            setIsLoading(false)
        }
    }, 500)

    const handleSelectLocation = selectedLocation => {
        const chosenLocation = locationOptions.locationNamesandIDs.filter(locationOption => locationOption.name === selectedLocation)[0]

        form.setFieldsValue({ location: chosenLocation.name, locationID: chosenLocation._id })
    }

    const handleSelectInstructor = selectedInstructor => {
        const chosenInstructor = instructorOptions.instructorNamesandIDs.filter(instructorOption => instructorOption.name === selectedInstructor)[0]

        form.setFieldsValue({ instructor: chosenInstructor.name, instructorID: chosenInstructor._id })
    }

    const initialValues = vehicle ? {
        brand: vehicle.brand,
        model: vehicle.model,
        modelYear: vehicle.modelYear,
        licensePlate: vehicle.licensePlate,
        category: vehicle.category,
        transmission: vehicle.transmission
    } : {}

    const modalTitle = isUpdateModal ? 'Update vehicle' : 'Register vehicle'

    return (
        <Modal
            destroyOnClose
            visible={visible}
            title={<span className="bold">{modalTitle}</span>}
            onCancel={() => onCancel()}
            cancelText="Cancel"
            okText={modalTitle}
            okButtonProps={{ loading: isLoading }}
            onOk={() => {
                form.validateFields()
                    .then(values => {
                        isUpdateModal ? handleUpdateVehicle(values) : handleCreateVehicle(values)
                    })
                    .catch(error => {
                        console.log("Validation Failed: ", error)
                    })
            }}
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
                            <DatePicker picker="year" className="w-full" />
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
                {/* Probably not needed, why would someone move a vehicle from a school to another? */}
                {/* <Row>
                    <Col span={11}>
                        <Form.Item name="school" label="School">

                        </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                        <Form.Item>

                        </Form.Item>
                    </Col>
                </Row> */}
                <Row>
                    <Col span={11}>
                        <Form.Item name="location" label="School location">
                            <AutoComplete
                                options={locationOptions.locationNames}
                                onSearch={handleLocationSearch}
                                onSelect={handleSelectLocation}>
                                <Input.Search loading={isLoading === 'locations'} />
                            </AutoComplete>
                        </Form.Item>
                        <Form.Item // Used to get the locationID when the location is selected in the next form item
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
                                onSearch={handleInstructorSearch}
                                onSelect={handleSelectInstructor}>
                                <Input.Search loading={isLoading === 'instructors'} />
                            </AutoComplete>
                        </Form.Item>
                        <Form.Item // Used to get the instructorID when the location is selected in the next form item
                            hidden
                            name="instructorID"
                        >
                            <Input hidden />
                        </Form.Item>
                    </Col>
                </Row>
                {/* TODO: Create a button that sets the machine as inopperable (it broke) */}
            </Form>
        </Modal>
    )
}

export default CreateEditVehicleModal
