import React, { useState, useContext } from 'react'
import { Form, TimePicker, DatePicker, Input, AutoComplete, Row, Col } from 'antd'
import isObject from 'lodash/isObject'
import moment from 'moment'

import renderRoleBasedContent from 'utils/functions/renderRoleBasedContent'
import { authContext } from 'utils/hoc/withAuth'
import { schoolContext } from 'utils/contexts/schoolContext'
import idFieldValidator from 'utils/functions/idFieldValidator'
import handleVehicleSearch from 'utils/functions/searches/handleVehicleSearch'
import handleLocationSearch from 'utils/functions/searches/handleLocationSearch'
import handleStudentSearch from 'utils/functions/searches/handleStudentSearch'
import handleInstructorSearch from 'utils/functions/searches/handleInstructorSearch'
import handleSelectVehicle from 'utils/functions/selectors/handleSelectVehicle'
import handleSelectLocation from 'utils/functions/selectors/handleSelectLocation'
import handleSelectStudent from 'utils/functions/selectors/handleSelectStudent'
import handleSelectInstructor from 'utils/functions/selectors/handleSelectInstructor'
import USER_ROLES from 'constants/USER_ROLES'

const CreateLessonForm = ({ form, lesson, visible, isLoading, setIsLoading }) => {
    const [instructorOptions, setInstructorOptions] = useState({ instructorNames: [], instructorNamesandIDs: [] })
    const [studentOptions, setStudentOptions] = useState({ studentNames: [], studentNamesandIDs: [] })
    const [vehicleOptions, setVehicleOptions] = useState({ vehicleNames: [], vehicleNamesandIDs: [] })
    const [locationOptions, setLocationOptions] = useState({ locationNames: [], locationNamesandIDs: [] })

    const auth = useContext(authContext)
    const { school } = useContext(schoolContext)

    const singleLocation = school?.locations?.length === 1
    const isUpdateModal = !!lesson
    const visibleIsRange = isObject(visible)
    const timeFormat = 'HH:mm'

    const studentSearchBar = (<>
        <Form.Item
            name="student"
            label="Student"
            rules={[
                { required: true, message: "Student is required" },
                ({ getFieldValue }) => idFieldValidator(getFieldValue, 'student', 'studentID', studentOptions.studentNamesandIDs, initialValues)
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

    return (
        <Form
            form={form}
            layout="vertical"
            name="lessonForm"
            initialValues={initialValues}
            validateTrigger="onBlur"
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
                                    ({ getFieldValue }) => idFieldValidator(getFieldValue, 'instructor', 'instructorID', instructorOptions.instructorNamesandIDs, initialValues)
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
                            ({ getFieldValue }) => idFieldValidator(getFieldValue, 'vehicle', 'vehicleID', vehicleOptions.vehicleNamesandIDs, initialValues)
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
                {auth.user.role === USER_ROLES.SCHOOL_ADMIN.tag && !singleLocation &&
                    <Col span={11} offset={2}>
                        <Form.Item
                            name="location"
                            label="Location"
                            rules={[
                                { required: true, message: "Location is required" },
                                ({ getFieldValue }) => idFieldValidator(getFieldValue, 'location', 'locationID', locationOptions.locationNamesandIDs, initialValues)
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
    )
}

export default CreateLessonForm
