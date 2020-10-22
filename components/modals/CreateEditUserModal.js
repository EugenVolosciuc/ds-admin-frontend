import React, { useState, useContext } from 'react'
import { Modal, Form, Input, Select, Row, Col, message } from 'antd'
import axios from 'axios'
import { mutate } from 'swr'

import USER_ROLES from 'constants/USER_ROLES'
import renderRoleBasedContent from 'utils/functions/renderRoleBasedContent'
import { authContext } from 'utils/hoc/withAuth'

const { Option } = Select

const CreateEditUserModal = ({ visible, onCancel, user }) => {
    const [isLoading, setIsLoading] = useState(false)
    const isUpdateModal = !!user

    const [form] = Form.useForm()

    const auth = useContext(authContext)

    const handleCreateUser = async values => {
        setIsLoading(true)
        try {
            await axios.post('/users', values)
            setIsLoading(false)
            onCancel()
            message.success('User created')
            await mutate('/users', data => ({ ...data, values }), true) // TODO: not working!
        } catch (error) {
            setIsLoading(false)
            console.log("Error creating user", error)
        }
    }

    const handleUpdateUser = async values => {
        setIsLoading(true)
        try {
            await axios.patch(`/users/${user._id}`, values)
            setIsLoading(false)
            onCancel()
            message.success('User updated')
            await mutate('/users', data => ({ ...data, values }), true) // TODO: not working!
        } catch (error) {
            setIsLoading(false)
            console.log("Error updating user", error)
        }
    }

    const initialValues = user ? {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role
    } : {}

    return (
        <Modal
            destroyOnClose
            visible={visible}
            title={<span className="bold">{isUpdateModal ? 'Update User' : 'Create User'}</span>}
            onCancel={() => onCancel()}
            cancelText="Cancel"
            okText={isUpdateModal ? 'Update User' : 'Create User'}
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
            </Form>
        </Modal>
    )
}

export default CreateEditUserModal
