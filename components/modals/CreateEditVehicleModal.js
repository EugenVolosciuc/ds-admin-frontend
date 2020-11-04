import React, { useState, useContext } from 'react'
import { Modal, Form, Input, Select, Row, Col, DatePicker, Spin, AutoComplete, message } from 'antd'
import axios from 'axios'
import debounce from 'lodash/debounce'
import dayjs from 'dayjs'

import TRANSMISSION_TYPES from 'constants/TRANSMISSION_TYPES'
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

    const getDataToUpdate = values => {
        const { brand, category, instructorID, licensePlate, locationID, model, modelYear, transmission } = values

        return {
            brand,
            category,
            instructor: instructorID,
            licensePlate,
            schoolLocation: locationID,
            model,
            transmission,
            modelYear: dayjs(modelYear).format('YYYY')
        }
    }

    const handleCreateVehicle = async values => {
        setIsLoading('register')
        try {
            await axios.post('/vehicles', getDataToUpdate(values))
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
            await axios.patch(`/vehicles/${vehicle._id}`, getDataToUpdate(values))
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
                        search: { name: value },
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
                        search: { lastName: value }, // TODO: somehow check firstname as well
                        school: auth.user.school,
                        role: USER_ROLES.INSTRUCTOR.tag
                    }
                })

                setInstructorOptions({
                    instructorNames: data.map(instructor => ({ value: `${instructor.lastName} ${instructor.firstName}` })),
                    instructorNamesandIDs: data.map(instructor => ({ id: instructor._id, name: `${instructor.lastName} ${instructor.firstName}` }))
                })
            } catch (error) {
                console.log("Error searching for instructors", error)
            }

            setIsLoading(false)
        }
    }, 500)

    const handleSelectLocation = selectedLocation => {
        const chosenLocation = locationOptions.locationNamesandIDs.filter(locationOption => locationOption.name === selectedLocation)[0]

        form.setFieldsValue({ location: chosenLocation.name, locationID: chosenLocation.id })
    }

    const handleSelectInstructor = selectedInstructor => {
        const chosenInstructor = instructorOptions.instructorNamesandIDs.filter(instructorOption => instructorOption.name === selectedInstructor)[0]

        form.setFieldsValue({ instructor: chosenInstructor.name, instructorID: chosenInstructor.id })
    }

    const initialValues = vehicle ? {
        brand: vehicle.brand,
        model: vehicle.model,
        modelYear: dayjs(vehicle.modelYear),
        licensePlate: vehicle.licensePlate,
        category: vehicle.category,
        ...(vehicle.transmission && { transmission: vehicle.transmission }),
        ...(vehicle.schoolLocation && {
            location: vehicle.schoolLocation.name,
            locationID: vehicle.schoolLocation._id
        }),
        ...(vehicle.instructor && {
            instructor: `${vehicle.instructor.firstName} ${vehicle.instructor.lastName}`,
            instructorID: vehicle.instructor._id
        }),
    } : {}

    console.log("VEHICLE!!", vehicle)
    const modalTitle = isUpdateModal ? 'Update vehicle' : 'Register vehicle'

    return (
        <Modal
            destroyOnClose
            visible={visible}
            title={<span className="bold">{modalTitle}</span>}
            onCancel={() => onCancel()}
            cancelText="Cancel"
            okText={modalTitle}
            okButtonProps={{ loading: isLoading === 'register' || isLoading === 'update' }}
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
                            <DatePicker picker="year" className="w-full" disabledDate={current => current && current > dayjs()} placeholder="" />
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
                        <Form.Item name="location" label="School location">
                            <AutoComplete
                                options={locationOptions.locationNames}
                                onSearch={handleLocationSearch}
                                onSelect={handleSelectLocation}>
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
                                onSearch={handleInstructorSearch}
                                onSelect={handleSelectInstructor}>
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
                {/* TODO: Create a button that sets the machine as inopperable (it broke) */}
            </Form>
        </Modal>
    )
}

export default CreateEditVehicleModal
