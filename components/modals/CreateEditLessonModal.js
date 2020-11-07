import React, { useState, useContext } from 'react'
import { Modal, Form, TimePicker, DatePicker, Input, AutoComplete, Row, Col, message } from 'antd'
import { mutate } from 'swr'
import isObject from 'lodash/isObject'
import debounce from 'lodash/debounce'
import moment from 'moment'
import axios from 'axios'

import USER_ROLES from 'constants/USER_ROLES'
import renderRoleBasedContent from 'utils/functions/renderRoleBasedContent'
import { authContext } from 'utils/hoc/withAuth'

const CreateEditLessonModal = ({ visible, onCancel, lesson }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [instructorOptions, setInstructorOptions] = useState({ instructorNames: [], instructorNamesandIDs: [] })
    const [studentOptions, setStudentOptions] = useState({ studentNames: [], studentNamesandIDs: [] })
    const [vehicleOptions, setVehicleOptions] = useState({ vehicleNames: [], vehicleNamesandIDs: [] })
    const [locationOptions, setLocationOptions] = useState({ locationNames: [], locationNamesandIDs: [] })

    const isUpdateModal = !!lesson
    const visibleIsSlot = isObject(visible)
    const timeFormat = 'HH:mm'
    const modalTitle = isUpdateModal ? 'Update lesson' : 'Create lesson'

    const [form] = Form.useForm()
    const auth = useContext(authContext)

    const getDataToUpdate = values => ({
        start: `${moment(values.date).format('YYYY-MM-DD')} ${moment(values.start).format('HH:mm')}`,
        end: `${moment(values.date).format('YYYY-MM-DD')} ${moment(values.end).format('HH:mm')}`,
        vehicle: values.vehicleID,
        ...(values.student && { student: values.studentID }),
        ...(values.instructor && { instructor: values.instructorID }),
        ...(values.location && { location: values.locationID })
    })

    const handleCreateLesson = async values => {
        setIsLoading('create')
        try {
            await axios.post('/lessons', getDataToUpdate(values))
            setIsLoading(false)
            onCancel()
            message.success('Lesson created')
            await mutate('/lessons', data => ({ ...data, values }), true) // TODO: not working!
        } catch (error) {
            setIsLoading(false)
            console.log("Error creating user", error)
        }
    }

    const handleInstructorSearch = debounce(async value => {
        if (value.length > 2) {
            try {
                setIsLoading('instructors')
                const { data } = await axios.get('/users/search', {
                    params: {
                        search: { lastName: value }, // TODO: somehow check firstname as well
                        school: auth.user.school,
                        role: [USER_ROLES.INSTRUCTOR.tag, USER_ROLES.SCHOOL_ADMIN.tag, USER_ROLES.LOCATION_ADMIN.tag]
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

    const handleStudentSearch = debounce(async value => {
        if (value.length > 2) {
            try {
                setIsLoading('students')
                const { data } = await axios.get('/users/search', {
                    params: {
                        search: { lastName: value }, // TODO: somehow check firstname as well
                        school: auth.user.school,
                        role: USER_ROLES.STUDENT.tag
                    }
                })

                setStudentOptions({
                    studentNames: data.map(student => ({ value: `${student.lastName} ${student.firstName}` })),
                    studentNamesandIDs: data.map(student => ({ id: student._id, name: `${student.lastName} ${student.firstName}` }))
                })
            } catch (error) {
                console.log("Error searching for students", error)
            }

            setIsLoading(false)
        }
    }, 500)

    const handleVehicleSearch = debounce(async value => {
        if (value.length > 2) {
            try {
                setIsLoading('vehicles')
                const { data } = await axios.get('/vehicles/search', {
                    params: {
                        search: { brand: value }, // TODO: somehow check other fields as well
                        school: auth.user.school,
                        ...(auth.user.location && { location: auth.user.location._id })
                    }
                })

                console.log("DATA", data)

                setVehicleOptions({
                    vehicleNames: data.map(vehicle => ({ value: `${vehicle.brand} ${vehicle.model}` })),
                    vehicleNamesandIDs: data.map(vehicle => ({ id: vehicle._id, name: `${vehicle.brand} ${vehicle.model}` }))
                })
            } catch (error) {
                console.log("Error searching for vehicles", error)
            }

            setIsLoading(false)
        }
    }, 500)

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

    const handleSelectInstructor = selectedInstructor => {
        const chosenInstructor = instructorOptions.instructorNamesandIDs.filter(instructorOption => instructorOption.name === selectedInstructor)[0]

        form.setFieldsValue({ instructor: chosenInstructor.name, instructorID: chosenInstructor.id })
    }

    const handleSelectStudent = selectedStudent => {
        const chosenStudent = studentOptions.studentNamesandIDs.filter(studentOption => studentOption.name === selectedStudent)[0]

        form.setFieldsValue({ student: chosenStudent.name, studentID: chosenStudent.id })
    }

    const handleSelectVehicle = selectedVehicle => {
        const chosenVehicle = vehicleOptions.vehicleNamesandIDs.filter(vehicleOption => vehicleOption.name === selectedVehicle)[0]

        form.setFieldsValue({ vehicle: chosenVehicle.name, vehicleID: chosenVehicle.id })
    }

    const handleSelectLocation = selectedLocation => {
        const chosenLocation = locationOptions.locationNamesandIDs.filter(locationOption => locationOption.name === selectedLocation)[0]

        form.setFieldsValue({ location: chosenLocation.name, locationID: chosenLocation.id })
    }

    const initialValues = lesson
        ? {}
        : visibleIsSlot
            ? {
                date: moment(visible.start),
                start: moment(visible.start),
                end: moment(visible.end)
            }
            : {}

    const studentSearchBar = (<>
        <Form.Item name="student" label="Student" rules={[{ required: true, message: "Student is required" }]}>
            <AutoComplete
                options={studentOptions.studentNames}
                onSearch={handleStudentSearch}
                onSelect={handleSelectStudent}>
                <Input.Search loading={isLoading === 'students'} />
            </AutoComplete>
        </Form.Item>
        <Form.Item
            hidden
            name="studentID"
        >
            <Input hidden />
        </Form.Item>
    </>)

    return (
        <Modal
            destroyOnClose
            visible={visible}
            title={<span className="bold">{modalTitle}</span>}
            onCancel={() => onCancel()}
            cancelText="Cancel"
            okText={modalTitle}
            okButtonProps={{ loading: isUpdateModal ? isLoading === 'update' : isLoading === 'create' }}
            onOk={() => {
                form.validateFields()
                    .then(values => {
                        isUpdateModal ? handleUpdateLesson(values) : handleCreateLesson(values)
                    })
                    .catch(error => {
                        console.log("Validation Failed: ", error)
                    })
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="lessonForm"
                initialValues={initialValues}
            >
                <Row>
                    <Col span={24}>
                        <Form.Item name="date" label="Date" rules={[{ required: true, message: "Date is required" }]}>
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <Form.Item name="start" label="Lesson start" rules={[{ required: true, message: "Lesson start is required" }]}>
                            <TimePicker format={timeFormat} className="w-full" minuteStep={10} />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                        <Form.Item name="end" label="Lesson end" rules={[{ required: true, message: "Lesson end is required" }]}>
                            <TimePicker format={timeFormat} className="w-full" minuteStep={10} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        {renderRoleBasedContent(
                            <>
                                <Form.Item name="instructor" label="Instructor" rules={[{ required: true, message: "Instructor is required" }]}>
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
                            </>,
                            { [USER_ROLES.INSTRUCTOR.tag]: studentSearchBar },
                            auth.user.role
                        )}
                    </Col>
                    <Col span={11} offset={2}>
                        {/* TODO: add an info icon to tell the user that the search works only by brand atm */}
                        <Form.Item name="vehicle" label="Vehicle" rules={[{ required: true, message: "Vehicle is required" }]}>
                            <AutoComplete
                                options={vehicleOptions.vehicleNames}
                                onSearch={handleVehicleSearch}
                                onSelect={handleSelectVehicle}>
                                <Input.Search loading={isLoading === 'vehicles'} />
                            </AutoComplete>
                        </Form.Item>
                        <Form.Item
                            hidden
                            name="vehicleID"
                        >
                            <Input hidden />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={auth.user.role === USER_ROLES.SCHOOL_ADMIN.tag ? 11 : 24}>
                        {renderRoleBasedContent(
                            null,
                            {
                                [USER_ROLES.SCHOOL_ADMIN.tag]: studentSearchBar,
                                [USER_ROLES.LOCATION_ADMIN.tag]: studentSearchBar,
                            },
                            auth.user.role
                        )}
                    </Col>
                    {auth.user.role === USER_ROLES.SCHOOL_ADMIN.tag &&
                        <Col span={11} offset={2}>
                            <Form.Item name="location" label="School location" rules={[{ required: true, message: "School location is required" }]}>
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
                    }
                </Row>
            </Form>
        </Modal>
    )
}

export default CreateEditLessonModal
