import React, { useState, useContext } from 'react'
import { Row, Col, Typography, Spin, Button, List, Divider, message, Modal, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import useSWR from 'swr'
import isEmpty from 'lodash/isEmpty'
import isNull from 'lodash/isNull'
import axios from 'axios'

import EXAMINATION_TYPES from 'constants/EXAMINATION_TYPES'
import EXAM_LOCATIONS from 'constants/EXAM_LOCATIONS'
import { schoolContext } from 'utils/contexts/schoolContext'
import fetcher from 'utils/functions/fetcher'
import CreateEditExamTypeModal from 'components/modals/CreateEditExamTypeModal'
import errorHandler from 'utils/functions/errorHandler'

const MAX_ALLOWED_EXAM_TYPES = 6

const ExamSettings = () => {
    const [showCreateExamTypeModal, setShowCreateExamTypeModal] = useState(false)
    const [showEditExamTypeModal, setShowEditExamTypeModal] = useState(null)

    const { school } = useContext(schoolContext)

    const url = '/exam-types'

    const { data, isValidating } = useSWR([url], () => fetcher(url, {
        filters: {
            school: school?._id
        }
    }))

    const toggleCreateExamTypeModal = () => setShowCreateExamTypeModal(!showCreateExamTypeModal)
    const toggleEditExamTypeModal = id => {
        if (id) return setShowEditExamTypeModal(id)

        setShowEditExamTypeModal(null)
    }

    const handleDeleteExamType = async id => {
        try {
            await axios.delete(`/exam-types/${id}`)
            message.success('Exam type deleted')
        } catch (error) {
            errorHandler(error)
        }
    }

    return (
        <Row>
            <CreateEditExamTypeModal visible={showCreateExamTypeModal} onCancel={toggleCreateExamTypeModal} examTypes={data} />
            {!isNull(showEditExamTypeModal) &&
                <CreateEditExamTypeModal
                    visible={showEditExamTypeModal}
                    onCancel={toggleEditExamTypeModal}
                    examType={data.find(examType => examType._id === showEditExamTypeModal)}
                    examTypes={data}
                />
            }
            <Col xs={24} lg={16}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Typography.Title level={4}>List of exam types</Typography.Title>
                    </Col>
                    <Col>
                        {(data || []).length < MAX_ALLOWED_EXAM_TYPES
                            ? <Button
                                type="primary"
                                style={{ marginBottom: '0.5em' }}
                                onClick={toggleCreateExamTypeModal}>
                                Create exam type
                            </Button>
                            : <Tooltip title={`You can create a maximum of ${MAX_ALLOWED_EXAM_TYPES} exam types.`}>
                                <Button style={{ marginBottom: '0.5em' }} disabled>
                                    Create exam type
                                </Button>
                            </Tooltip>
                        }
                    </Col>
                </Row>
                <Divider style={{ margin: '0 0 8px 0' }} />
                {isValidating
                    ? <Row justify="center"><Spin /></Row>
                    : isEmpty(data)
                        ? <Typography.Paragraph>No exam types found. Create one now so that you can schedule exams for your school.</Typography.Paragraph>
                        : <List
                            dataSource={data}
                            itemLayout="vertical"
                            renderItem={item => (
                                <List.Item style={{ maxHeight: 500 }}>
                                    <Row className="w-full" justify="space-between">
                                        <Col>
                                            <Typography.Title level={5}>{item.name}</Typography.Title>
                                        </Col>
                                        <Col>
                                            <span>
                                                <EditOutlined style={{ marginRight: 16 }} onClick={() => toggleEditExamTypeModal(item._id)} />
                                                <DeleteOutlined
                                                    className="text-error"
                                                    onClick={() => Modal.confirm({
                                                        okText: 'Yes',
                                                        cancelText: 'No',
                                                        okButtonProps: { danger: true },
                                                        onOk: () => handleDeleteExamType(item._id),
                                                        content: <span>Are you sure you want to delete "{item.name}"?</span>
                                                    })}
                                                />
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 8 }}>
                                        <Col span={11}>
                                            <Typography.Text strong className="block">Examination</Typography.Text>
                                            <Typography.Text className="block">{EXAMINATION_TYPES[item.examination].label}</Typography.Text>
                                        </Col>
                                        <Col span={11} offset={2}>
                                            <Typography.Text strong className="block">Exam location</Typography.Text>
                                            <Typography.Text className="block">{EXAM_LOCATIONS[item.examLocation].label}</Typography.Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 8 }}>
                                        <Col span={11}>
                                            <Typography.Text strong className="block">Takes place at a specific time</Typography.Text>
                                            <Typography.Text className="block">{item.specificTime ? 'Yes' : 'No'}</Typography.Text>
                                        </Col>
                                        <Col span={11} offset={2}>
                                            <Typography.Text strong className="block">Is the final exam</Typography.Text>
                                            <Typography.Text className="block">{item.isFinalExam ? 'Yes' : 'No'}</Typography.Text>
                                        </Col>
                                    </Row>
                                </List.Item>
                            )}
                        />
                }
            </Col>
        </Row>
    )
}

export default ExamSettings
