import React, { useState, useContext } from 'react'
import { Modal, Form, TimePicker, DatePicker, Input, AutoComplete, Row, Col, message } from 'antd'
import { mutate } from 'swr'
import isObject from 'lodash/isObject'
import moment from 'moment'
import axios from 'axios'

import USER_ROLES from 'constants/USER_ROLES'
import renderRoleBasedContent from 'utils/functions/renderRoleBasedContent'
import { authContext } from 'utils/hoc/withAuth'
import errorHandler from 'utils/functions/errorHandler'
import idFieldValidator from 'utils/functions/idFieldValidator'
import handleVehicleSearch from 'utils/functions/searches/handleVehicleSearch'
import handleLocationSearch from 'utils/functions/searches/handleLocationSearch'
import handleStudentSearch from 'utils/functions/searches/handleStudentSearch'
import handleInstructorSearch from 'utils/functions/searches/handleInstructorSearch'
import handleSelectVehicle from 'utils/functions/selectors/handleSelectVehicle'
import handleSelectLocation from 'utils/functions/selectors/handleSelectLocation'
import handleSelectStudent from 'utils/functions/selectors/handleSelectStudent'
import handleSelectInstructor from 'utils/functions/selectors/handleSelectInstructor'

const CreateEditLessonModal = ({ visible, onCancel, lesson }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [instructorOptions, setInstructorOptions] = useState({ instructorNames: [], instructorNamesandIDs: [] })
    const [studentOptions, setStudentOptions] = useState({ studentNames: [], studentNamesandIDs: [] })
    const [vehicleOptions, setVehicleOptions] = useState({ vehicleNames: [], vehicleNamesandIDs: [] })
    const [locationOptions, setLocationOptions] = useState({ locationNames: [], locationNamesandIDs: [] })

    const isUpdateModal = !!lesson
    const visibleIsRange = isObject(visible)
    const timeFormat = 'HH:mm'
    const modalTitle = isUpdateModal ? 'Update lesson' : 'Schedule lesson'

    const [form] = Form.useForm()
    const auth = useContext(authContext)

    const getDataToSend = values => ({
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
            await axios.post('/lessons', getDataToSend(values))
            setIsLoading(false)
            onCancel()
            message.success('Lesson created')
            await mutate('/lessons', data => ({ ...data, values }), true) // TODO: not working!
        } catch (error) {
            setIsLoading(false)
            errorHandler(error, form)
        }
    }

    const initialValues = lesson
        ? {
            date: moment(lesson.start),
            start: moment(lesson.start),
            end: moment(lesson.end),
            instructor: `${lesson.instructor.lastName} ${lesson.instructor.firstName}`,
            instructorID: lesson.instructor._id,
            vehicle: `${lesson.vehicle.brand} ${lesson.vehicle.model}`,
            vehicleID: lesson.vehicle._id,
            student: `${lesson.student.lastName} ${lesson.student.firstName}`,
            studentID: lesson.student._id,
            location: lesson.location.name,
            locationID: lesson.location._id,
        }
        : visibleIsRange
            ? {
                date: moment(visible.start),
                start: moment(visible.start),
                end: moment(visible.end)
            }
            : {}

    const studentSearchBar = (<>
        <Form.Item
            name="student"
            label="Student"
            rules={[
                { required: true, message: "Student is required" },
                ({ getFieldValue }) => idFieldValidator(getFieldValue, 'student', 'studentID', studentOptions.studentNamesandIDs)
            ]}
        >
            <AutoComplete
                options={studentOptions.studentNames}
                onSearch={value => handleStudentSearch(value, setIsLoading, auth, setStudentOptions, form)}
                onSelect={selectedStudent => handleSelectStudent(selectedStudent, studentOptions, form)}>
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
                                <Form.Item 
                                    name="instructor" 
                                    label="Instructor" 
                                    rules={[
                                        { required: true, message: "Instructor is required" },
                                        ({ getFieldValue }) => idFieldValidator(getFieldValue, 'instructor', 'instructorID', instructorOptions.instructorNamesandIDs)
                                    ]}
                                >
                                    <AutoComplete
                                        options={instructorOptions.instructorNames}
                                        onSearch={value => handleInstructorSearch(value, setIsLoading, auth, setInstructorOptions, form)}
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
                            </>,
                            { [USER_ROLES.INSTRUCTOR.tag]: studentSearchBar },
                            auth.user.role
                        )}
                    </Col>
                    <Col span={11} offset={2}>
                        {/* TODO: add an info icon to tell the user that the search works only by brand atm */}
                        <Form.Item 
                            name="vehicle" 
                            label="Vehicle" 
                            rules={[
                                { required: true, message: "Vehicle is required" },
                                ({ getFieldValue }) => idFieldValidator(getFieldValue, 'vehicle', 'vehicleID', vehicleOptions.vehicleNamesandIDs)
                            ]}
                        >
                            <AutoComplete
                                options={vehicleOptions.vehicleNames}
                                onSearch={value => handleVehicleSearch(value, setIsLoading, auth, setVehicleOptions, form)}
                                onSelect={selectedVehicle => handleSelectVehicle(selectedVehicle, vehicleOptions, form)}>
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
                            <Form.Item 
                                name="location" 
                                label="Location" 
                                rules={[
                                    { required: true, message: "Location is required" },
                                    ({ getFieldValue }) => idFieldValidator(getFieldValue, 'location', 'locationID', locationOptions.locationNamesandIDs)
                                ]}
                            >
                                <AutoComplete
                                    options={locationOptions.locationNames}
                                    onSearch={value => handleLocationSearch(value, setIsLoading, auth, setLocationOptions, form)}
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
                    }
                </Row>
            </Form>
        </Modal>
    )
}

export default CreateEditLessonModal
