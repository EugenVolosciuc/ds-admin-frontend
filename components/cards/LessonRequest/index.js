import React, { useState, useContext } from 'react'
import { Row, Col, Typography, message } from 'antd'
import { CloseOutlined, CheckOutlined } from '@ant-design/icons'
import moment from 'moment'
import axios from 'axios'

import getLessonTitle from 'utils/functions/getLessonTitle'
import { authContext } from 'utils/hoc/withAuth'
import errorHandler from 'utils/functions/errorHandler'
import SimpleTextareaModal from 'components/modals/SimpleTextareaModal'

const { Text } = Typography

const LessonRequest = ({ lesson }) => {
    const [showRejectionReasonModal, setShowRejectionReasonModal] = useState(false)

    const { user } = useContext(authContext)

    const isRejected = !!lesson.rejectionReason

    const handleLessonRequestReview = async (action, rejectionReason) => {
        try {
            await axios.post(`/lesson-requests/${lesson._id}/review`, {
                action,
                ...(rejectionReason && { rejectionReason })
            })

            message.success(`Lesson request ${action === 'accept' ? 'accepted' : 'rejected'}`)

            if (showRejectionReasonModal) toggleRejectionReasonModal()
        } catch (error) {
            errorHandler(error)
        }
    }

    const toggleRejectionReasonModal = () => setShowRejectionReasonModal(!showRejectionReasonModal)

    return (
        <>
            <SimpleTextareaModal
                visible={showRejectionReasonModal}
                onCancel={toggleRejectionReasonModal}
                onOk={rejectionReason => handleLessonRequestReview('reject', rejectionReason)}
                title="Add rejection reason"
                okBtnTitle="Reject"
                text="Add a rejection reason to let the student know why the lesson request was rejected (optional):"
            />
            <Row className="w-full" gutter={[16, 8]}>
                <Col span={isRejected ? 24 : 20}>
                    <Row justify="space-between" gutter={[0, 8]}>
                        <Col>
                            <Text type="secondary">{moment(lesson.start).format('DD-MM-YYYY')}</Text>
                        </Col>
                        <Col>
                            <Text type="secondary">{moment(lesson.start).format('HH:mm')} - {moment(lesson.end).format('HH:mm')}</Text>
                        </Col>
                    </Row>
                    <Row gutter={[0, 8]}>
                        <Col><Text delete={isRejected}>{getLessonTitle(lesson, user.role)}</Text></Col>
                    </Row>
                    {isRejected &&
                        <Row gutter={[0, 8]}><Col>Rejection reason: {lesson.rejectionReason}</Col></Row>
                    }
                </Col>
                {!isRejected &&
                    <Col span={4}>
                        <Row align="middle" justify="end" className="h-full" gutter={[0, 8]}>
                            <Col span={24} className="text-right"><CheckOutlined style={{ color: '#52c41a', fontSize: 20 }} onClick={() => handleLessonRequestReview('accept')} /></Col>
                            <Col span={24} className="text-right"><CloseOutlined style={{ color: '#f5222d', fontSize: 20 }} onClick={toggleRejectionReasonModal} /></Col>
                        </Row>
                    </Col>
                }
            </Row>
        </>

    )
}

export default LessonRequest
