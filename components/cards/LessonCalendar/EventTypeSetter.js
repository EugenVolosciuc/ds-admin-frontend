import React from 'react'
import { Checkbox, Row, Col } from 'antd'

const EventTypeSetter = ({ eventTypes, setEventTypes }) => {
    const handleChange = event => {
        if (eventTypes.includes(event.target.value)) {
            const filteredTypes = eventTypes.filter(type => type !== event.target.value)
            setEventTypes(filteredTypes)
        } else {
            setEventTypes([...eventTypes, event.target.value])
        }
    }

    return (
        <Row>
            <Col><Checkbox onChange={handleChange} value="lessons" checked={eventTypes.includes("lessons")}>Lessons</Checkbox></Col>
            <Col><Checkbox onChange={handleChange} value="lesson-requests" checked={eventTypes.includes("lesson-requests")}>Lesson requests</Checkbox></Col>
            <Col><Checkbox onChange={handleChange} value="exams" checked={eventTypes.includes("exams")}>Exams</Checkbox></Col>
        </Row>
    )
}

export default EventTypeSetter
