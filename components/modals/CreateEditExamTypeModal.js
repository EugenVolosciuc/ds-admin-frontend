import React, { useState, useContext } from 'react'
import { Modal, Form, Button, Row, Col, Input, Select, Tooltip, Checkbox, message } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import axios from 'axios'

import EXAMINATION_TYPES from 'constants/EXAMINATION_TYPES'
import EXAM_LOCATIONS from 'constants/EXAM_LOCATIONS'
import errorHandler from 'utils/functions/errorHandler'
import { schoolContext } from 'utils/contexts/schoolContext'

const CreateEditExamTypeModal = ({ visible, onCancel, examType, examTypes }) => {
    const [isLoading, setIsLoading] = useState(false)


    const [form] = Form.useForm()
    const { school } = useContext(schoolContext)

    const isUpdateModal = !!examType
    const modalTitle = isUpdateModal ? 'Modify exam type' : 'Create exam type'
    const updatableFields = ['name', 'isFinalExam']
    const finalExamIsAlreadySet = (examTypes || []).some(type => type?.isFinalExam && type._id !== examType?._id)
    const modalFooter = (
        <Row justify={"end"}>
            <Col span={16}>
                <Button onClick={() => onCancel()}>Close</Button>
                <Button
                    onClick={() => form.validateFields().then(values => isUpdateModal ? handleModifyExamType(values) : handleCreateExamType(values))}
                    loading={isLoading === 'create' || isLoading === 'modify'}
                    type="primary"
                >
                    {modalTitle}
                </Button>
            </Col>
        </Row>
    )

    const initialValues = isUpdateModal
        ? {
            name: examType.name,
            examLocation: examType.examLocation,
            examination: examType.examination,
            specificTime: examType.specificTime,
            isFinalExam: examType.isFinalExam,
            withInstructor: examType.withInstructor
        }
        : {
            specificTime: false,
            isFinalExam: false,
            withInstructor: false
        }

    const handleCreateExamType = async values => {
        setIsLoading('create')
        try {
            await axios.post('/exam-types', {
                ...values,
                school: school._id,
                isFinalExam: values.isFinalExam || false
            })
            setIsLoading(false)
            onCancel()
            message.success('Exam type created')
        } catch (error) {
            setIsLoading(false)
            errorHandler(error, form)
        }
    }

    const handleModifyExamType = async values => {
        setIsLoading('modify')
        try {
            await axios.patch(`/exam-types/${examType._id}`, {
                ...values,
                school: school._id,
                isFinalExam: values.isFinalExam
            })
            setIsLoading(false)
            onCancel()
            message.success('Exam type modified')
        } catch (error) {
            setIsLoading(false)
            errorHandler(error, form)
        }
    }

    return (
        <Modal
            destroyOnClose
            title={<span className="bold">{modalTitle}</span>}
            visible={visible}
            onCancel={() => onCancel()}
            footer={modalFooter}
        >
            <Form
                layout="vertical"
                name="examTypeForm"
                form={form}
                initialValues={initialValues}
                validateTrigger="onBlur"
            >
                <Row>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: "Name is required" }]}
                        >
                            <Input disabled={isUpdateModal && !updatableFields.includes('name')} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <Form.Item
                            name="examination"
                            label="Examination"
                            rules={[{ required: true, message: "Examination is required" }]}
                        >
                            <Select disabled={isUpdateModal && !updatableFields.includes('examination')}>
                                {Object.values(EXAMINATION_TYPES).map(examination => (
                                    <Select.Option value={examination.tag} key={examination.tag}>
                                        {examination.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={2}>
                        <Form.Item
                            name="examLocation"
                            label="Exam location"
                            rules={[{ required: true, message: "Exam location is required" }]}
                        >
                            <Select disabled={isUpdateModal && !updatableFields.includes('examLocation')}>
                                {Object.values(EXAM_LOCATIONS).map(examLocation => (
                                    <Select.Option value={examLocation.tag} key={examLocation.tag}>
                                        {examLocation.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <Form.Item>
                            {finalExamIsAlreadySet
                                ? <Tooltip title="You have already set an exam as final. You can only have one final exam.">
                                    <Checkbox disabled>Is final exam</Checkbox>
                                </Tooltip>
                                : <Form.Item name="isFinalExam" valuePropName="checked" noStyle>
                                    <Checkbox disabled={isUpdateModal && !updatableFields.includes('isFinalExam')}>Is final exam</Checkbox>
                                </Form.Item>
                            }

                            <Tooltip title="If checked, if the student passes this exam, it means the student graduated driving school. There can only be one final exam.">
                                <InfoCircleOutlined style={{ marginLeft: 2 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item>
                            <Form.Item name="withInstructor" valuePropName="checked" noStyle>
                                <Checkbox disabled={isUpdateModal && !updatableFields.includes('withInstructor')}>With instructor</Checkbox>
                            </Form.Item>
                            <Tooltip title="Check this if an instructor is present at this type of exams.">
                                <InfoCircleOutlined style={{ marginLeft: 2 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col span={7} offset={1}>
                        <Form.Item>
                            <Form.Item name="specificTime" valuePropName="checked" noStyle>
                                <Checkbox disabled={isUpdateModal && !updatableFields.includes('specificTime')}>Specific time</Checkbox>
                            </Form.Item>
                            <Tooltip title="Check if this type of exam can be scheduled at a specific hour or leave it unchecked if the exam time is unknown (e.g. from morning till evening).">
                                <InfoCircleOutlined style={{ marginLeft: 2 }} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default CreateEditExamTypeModal
