import React from 'react'
import { Row, Col } from 'antd'

const CalendarLegend = () => {
    return (
        <Row align="middle" justify="end">
            <Col>
                <span className="legend-item legend-item-lesson" />
                <span>Lessons</span>
            </Col>
            <Col>
                <span className="legend-item legend-item-lesson-request" />
                <span>Lesson requests</span>
            </Col>
            <Col>
                <span className="legend-item legend-item-exam" />
                <span>Exams</span>
            </Col>
        </Row>
    )
}

export default CalendarLegend
