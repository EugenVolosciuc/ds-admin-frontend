import React, { useContext } from 'react'
import { Row, Col } from 'antd'
import dayjs from 'dayjs'
import useSWR from 'swr'

import { withAuth } from 'utils/hoc/withAuth'
import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout'
import LessonCalendar from 'components/cards/LessonCalendar/LessonCalendar'
import { authContext } from 'utils/hoc/withAuth'
import fetcher from 'utils/functions/fetcher'

const CalendarPage = () => {
    const { user, userLoading } = useContext(authContext)
    const url = '/lessons'

    const { data, error, isValidating, mutate } = useSWR([url], () => fetcher(url, {
        filters: { 
            school: user.school,
            startAt: '2020-10-01',
            endAt: '2020-11-01'
        }
    }))

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