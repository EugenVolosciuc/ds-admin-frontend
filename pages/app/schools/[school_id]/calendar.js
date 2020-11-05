import React from 'react'
import { Row, Col } from 'antd'
import dayjs from 'dayjs'

import { withAuth } from 'utils/hoc/withAuth'
import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout'
import LessonCalendar from 'components/cards/LessonCalendar/LessonCalendar'

const CalendarPage = () => {

    const handleDaySelect = date => {
        console.log("date", date)
    }

    return (
        <DashboardLayout title="Calendar">
            <Row gutter={8}>
                {/* Lesson requests */}
                <Col xs={24} md={6}>
                    <p>Lesson requests</p>
                </Col>
                {/* Calendar */}
                <Col xs={24} md={18}>
                    <LessonCalendar handleSelect={handleDaySelect} />
                </Col>
            </Row>
        </DashboardLayout>
    )
}

export default withAuth(CalendarPage)