import React, { useEffect } from 'react'
import { Checkbox, Row, Col } from 'antd'

const EventTypeSetter = ({ eventTypes, setEventTypes }) => {
    const handleChange = event => {
        if (eventTypes.includes(event.target.value)) {
            const filteredTypes = eventTypes.filter(type => type !== event.target.value)
            setEventTypes(filteredTypes)
            localStorage.setItem('calendarEventTypes', JSON.stringify(filteredTypes))
        } else {
            setEventTypes([...eventTypes, event.target.value])
            localStorage.setItem('calendarEventTypes', JSON.stringify([...eventTypes, event.target.value]))
        }
    }

    useEffect(() => {
        const localStorageCalendarEventTypes = localStorage.getItem('calendarEventTypes')
        if (localStorageCalendarEventTypes) {
            try {
                setEventTypes(JSON.parse(localStorageCalendarEventTypes))
            } catch (error) {
                console.error("Error parsing calendar event types from local storage", error)
            }
        }
    }, [])

    return (
        <Row>
            <Col><Checkbox onChange={handleChange} value="lessons" checked={eventTypes.includes("lessons")}>Lessons</Checkbox></Col>
            <Col><Checkbox onChange={handleChange} value="lesson-requests" checked={eventTypes.includes("lesson-requests")}>Lesson requests</Checkbox></Col>
            <Col><Checkbox onChange={handleChange} value="exams" checked={eventTypes.includes("exams")}>Exams</Checkbox></Col>
        </Row>
    )
}

export default EventTypeSetter
