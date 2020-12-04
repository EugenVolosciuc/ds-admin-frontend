// NOTE: Used by SCHOOL_ADMIN, LOCATION_ADMIN and INSTRUCTOR
import React, { useState, useContext, useEffect } from 'react'
import { Modal, Form, Row, Col, Button, message, Radio, Divider } from 'antd'
import { mutate } from 'swr'
import moment from 'moment'
import axios from 'axios'

import { schoolContext } from 'utils/contexts/schoolContext'
import errorHandler from 'utils/functions/errorHandler'
import CreateLessonForm from 'components/forms/CreateLessonForm'
import CreateExamForm from 'components/forms/CreateExamForm'

const CreateLessonOrExamModal = ({ visible, onCancel, examTypes }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [itemToCreate, setItemToCreate] = useState('lesson')

    const [lessonForm] = Form.useForm()
    const [examForm] = Form.useForm()
    const { school } = useContext(schoolContext)

    const singleLocation = school?.locations?.length === 1
    const timeFormat = 'HH:mm'

    const modalTitle = 'Schedule ' + (itemToCreate === 'lesson' ? 'lesson' : 'exam')

    const getDataToSend = values => ({
        start: `${moment(values.date).format('YYYY-MM-DD')} ${moment(values.start).format(timeFormat)}`,
        end: `${moment(values.date).format('YYYY-MM-DD')} ${moment(values.end).format(timeFormat)}`,
        vehicle: values.vehicleID,
        ...(values.student && { student: values.studentID }),
        ...(values.instructor && { instructor: values.instructorID }),
        ...(values.location && { location: singleLocation ? school.locations[0] : values.locationID }),
        ...(values.examType && { examType: values.examType })
    })

    const handleCreateLesson = async values => {
        setIsLoading('create')
        try {
            const lesson = await axios.post('/lessons', getDataToSend(values))
            setIsLoading(false)
            onCancel()
            message.success('Lesson created')
            await mutate('/lessons', data => ({ ...data, lesson }), true) // TODO: not working!
        } catch (error) {
            setIsLoading(false)
            errorHandler(error, lessonForm)
        }
    }

    const handleCreateExam = async values => {
        setIsLoading('create')
        try {
            const lesson = await axios.post('/exams', getDataToSend(values))
            setIsLoading(false)
            onCancel()
            message.success('Exam created')
            await mutate('/exams', data => ({ ...data, lesson }), true) // TODO: not working!
        } catch (error) {
            setIsLoading(false)
            errorHandler(error, examForm)
        }
    }

    const modalFooter = (
        <Row justify="end">
            <Col span={16}>
                <Button onClick={() => onCancel()}>Close</Button>
                <Button
                    onClick={() => {
                        itemToCreate === 'lesson'
                            ? lessonForm.validateFields().then(values => handleCreateLesson(values))
                            : examForm.validateFields().then(values => handleCreateExam(values))
                    }}
                    loading={isLoading === 'update' || isLoading === 'create'}
                    type="primary"
                >
                    {modalTitle}
                </Button>
            </Col>
        </Row>
    )

    return (
        <Modal
            style={{ paddingTop: 16 }}
            destroyOnClose
            visible={visible}
            title={<span className="bold">{modalTitle}</span>}
            onCancel={() => onCancel()}
            footer={modalFooter}
        >
            <Radio.Group onChange={event => setItemToCreate(event.target.value)} value={itemToCreate} className="w-full">
                <Row justify="space-around">
                    <Col span={12}>
                        <Radio value="lesson">Lesson</Radio>
                    </Col>
                    <Col span={12}>
                        <Radio value="exam">Exam</Radio>
                    </Col>
                </Row>
            </Radio.Group>
            <Divider style={{ margin: '16px 0' }} />
            {itemToCreate === 'lesson'
                ? <CreateLessonForm form={lessonForm} visible={visible} isLoading={isLoading} setIsLoading={setIsLoading} />
                : <CreateExamForm form={examForm} visible={visible} isLoading={isLoading} setIsLoading={setIsLoading} examTypes={examTypes} />
            }
        </Modal>
    )
}

export default CreateLessonOrExamModal
