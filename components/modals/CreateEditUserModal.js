import React, { useState, useContext } from 'react'
import { Modal, Form, Input, Select, Row, Col, AutoComplete, message } from 'antd'
import axios from 'axios'
import { mutate } from 'swr'

import USER_ROLES from 'constants/USER_ROLES'
import renderRoleBasedContent from 'utils/functions/renderRoleBasedContent'
import { authContext } from 'utils/hoc/withAuth'
import errorHandler from 'utils/functions/errorHandler'
import idFieldValidator from 'utils/functions/idFieldValidator'
import handleStudentSearch from 'utils/functions/searches/handleStudentSearch'
import handleInstructorSearch from 'utils/functions/searches/handleInstructorSearch'
import handleVehicleSearch from 'utils/functions/searches/handleVehicleSearch'
import handleLocationSearch from 'utils/functions/searches/handleLocationSearch'
import handleSelectVehicle from 'utils/functions/selectors/handleSelectVehicle'
import handleSelectLocation from 'utils/functions/selectors/handleSelectLocation'
import handleSelectStudent from 'utils/functions/selectors/handleSelectStudent'
import handleSelectInstructor from 'utils/functions/selectors/handleSelectInstructor'

const { Option } = Select

// userRole - role of the edited user
const CreateEditUserModal = ({ visible, onCancel, user, userRole }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [instructorOptions, setInstructorOptions] = useState({ instructorNames: [], instructorNamesandIDs: [] })
    const [studentOptions, setStudentOptions] = useState({ studentNames: [], studentNamesandIDs: [] })
    const [vehicleOptions, setVehicleOptions] = useState({ vehicleNames: [], vehicleNamesandIDs: [] })
    const [locationOptions, setLocationOptions] = useState({ locationNames: [], locationNamesandIDs: [] })

    const auth = useContext(authContext)

    const isUpdateModal = !!user

    const [form] = Form.useForm()

    const getDataToSend = values => {
        const { email, firstName, lastName, phoneNumber, role, locationID, vehicleID, studentID, instructorID } = values

        return {
            email,
            firstName,
            lastName,
            phoneNumber,
            ...(userRole && !isUpdateModal ? { role: userRole.tag } : { role }),
            ...(locationID && { location: locationID }),
            ...(vehicleID && { vehicle: vehicleID }),
            ...(studentID && { student: studentID }),
            ...(instructorID && { instructor: instructorID }),
        }
    }

    const handleCreateUser = async values => {
        setIsLoading(true)
        try {
            await axios.post('/users', getDataToSend(values))
            setIsLoading(false)
            onCancel()
            message.success('User created')
            await mutate('/users', data => ({ ...data, values }), true) // TODO: not working!
        } catch (error) {
            setIsLoading(false)
            errorHandler(error, form)
        }
    }

    const handleUpdateUser = async values => {
        getDataToSend(values)
        setIsLoading(true)
        try {
            await axios.patch(`/users/${user._id}`, getDataToSend(values))
            setIsLoading(false)
            onCancel()
            message.success('User updated')
            await mutate('/users', data => ({ ...data, values }), true) // TODO: not working! IDEA: instead of values, why not add what I have from the request response?
        } catch (error) {
            setIsLoading(false)
            errorHandler(error, form)
        }
    }

    const initialValues = user ? {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        ...(user.location && {
            location: user.location.name,
            locationID: user.location._id
        }),
        ...(user.instructor && {
            instructor: `${user.instructor.firstName} ${user.instructor.lastName}`,
            instructorID: user.instructor._id
        }),
        ...(user.student && {
            student: `${user.student.firstName} ${user.student.lastName}`,
            studentID: user.student._id
        }),
        ...(user.vehicle && {
            vehicle: `${user.vehicle.brand} ${user.vehicle.model}`,
            vehicleID: user.vehicle._id
        }),
    } : {}

    const modalTitle = isUpdateModal ? `Update ${(userRole?.label || 'User').toLowerCase()}` : `Register ${(userRole?.label || 'User').toLowerCase()}`

    const studentSearchBar = (<>
        <Form.Item name="student" label="Student" rules={[{ required: true, message: "Student is required" }]}>
            <AutoComplete
                options={studentOptions.studentNames}
                onSearch={value => handleStudentSearch(value, setIsLoading, auth, setStudentOptions)}
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

    const instructorSearchBar = (<>
        <Form.Item
            name="instructor"
            label="Instructor"
            rules={[({ getFieldValue }) => idFieldValidator(getFieldValue, 'instructor', 'instructorID', instructorOptions.instructorNamesandIDs)]}
        >
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
    </>)

    const vehicleSearchBar = (<>
        {/* TODO: add an info icon to tell the user that the search works only by brand atm */}
        <Form.Item
            name="vehicle"
            label="Vehicle"
            rules={[({ getFieldValue }) => idFieldValidator(getFieldValue, 'vehicle', 'vehicleID', vehicleOptions.vehicleNamesandIDs)]}
        >
            <AutoComplete
                options={vehicleOptions.vehicleNames}
                onSearch={value => handleVehicleSearch(value, setIsLoading, auth, setVehicleOptions)}
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
    </>)

    const locationSearchBar = (<>
        <Form.Item
            name="location"
            label="Location"
            rules={[({ getFieldValue }) => idFieldValidator(getFieldValue, 'location', 'locationID', locationOptions.locationNamesandIDs)]}
        >
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
    </>)

    const renderExtraFields = () => {
        switch (auth.user.role) {
            case USER_ROLES.SCHOOL_ADMIN.tag:
                return <>
                    <Row>
                        <Col span={11}>
                            {userRole.tag === USER_ROLES.STUDENT.tag && instructorSearchBar}
                            {userRole.tag === USER_ROLES.INSTRUCTOR.tag && locationSearchBar}
                        </Col>
                        <Col span={11} offset={2}>{vehicleSearchBar}</Col>
                    </Row>
                    {userRole.tag === USER_ROLES.STUDENT.tag &&
                        <Row>
                            <Col span={24}>{locationSearchBar}</Col>
                        </Row>
                    }
                </>
            case USER_ROLES.LOCATION_ADMIN.tag:
                return <Row>
                    <Col span={11}>
                        {userRole.tag === USER_ROLES.STUDENT.tag && instructorSearchBar}
                        {userRole.tag === USER_ROLES.INSTRUCTOR.tag && studentSearchBar}
                    </Col>
                    <Col span={11} offset={2}>{vehicleSearchBar}</Col>
                </Row>
            default:
                return null
        }
    }

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
                        isUpdateModal ? handleUpdateUser(values) : handleCreateUser(values)
                    })
                    .catch(error => {
                        console.log("Validation Failed: ", error)
                    })
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="userForm"
                initialValues={initialValues}
            >
                <Row>
                    <Col span={11}>
                        <Form.Item name="firstName" label="First name" rules={[{ required: true, message: "First name is required" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                        <Form.Item name="lastName" label="Last name" rules={[{ required: true, message: "Last name is required" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <Form.Item name="phoneNumber" label="Phone number" rules={[{ required: true, message: "Phone number is required" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: "Email should be valid" }]} validateTrigger="onBlur">
                            <Input type="email" />
                        </Form.Item>
                    </Col>
                </Row>
                {
                    renderRoleBasedContent(
                        null,
                        {
                            [USER_ROLES.SUPER_ADMIN.tag]: (
                                <Row>
                                    <Col span={24}>
                                        <Form.Item name="role" label="Role" rules={[{ required: true, message: "Role is required" }]}>
                                            <Select>
                                                {Object.values(USER_ROLES).filter(role => role.tag != USER_ROLES.SUPER_ADMIN.tag).map(role => (
                                                    <Option key={role.tag} value={role.tag}>{role.label}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )
                        },
                        auth.user.role
                    )
                }
                {renderExtraFields()}
            </Form>
        </Modal>
    )
}

export default CreateEditUserModal
