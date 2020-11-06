import React, { useState, useContext } from 'react'
import { Modal, Form, Input, Select, Row, Col, message } from 'antd'

import USER_ROLES from 'constants/USER_ROLES'
import renderRoleBasedContent from 'utils/functions/renderRoleBasedContent'
import { authContext } from 'utils/hoc/withAuth'

const CreateEditLessonModal = ({ visible, onCancel, lesson }) => {
    const [isLoading, setIsLoading] = useState(false)
    const isUpdateModal = !!lesson

    const [form] = Form.useForm()

    const auth = useContext(authContext)

    return (
        <Modal
            destroyOnClose
            visible={visible}
            // title={<span className="bold">{modalTitle}</span>}
            onCancel={() => onCancel()}
            // cancelText="Cancel"
            // okText={modalTitle}
            // okButtonProps={{ loading: isLoading }}
            // onOk={() => {
            //     form.validateFields()
            //         .then(values => {
            //             isUpdateModal ? handleUpdateUser(values) : handleCreateUser(values)
            //         })
            //         .catch(error => {
            //             console.log("Validation Failed: ", error)
            //         })
            // }}
        >

        </Modal>
    )
}

export default CreateEditLessonModal
