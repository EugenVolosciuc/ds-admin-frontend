import React, { useState, useEffect, useContext } from 'react'
import { Row, Col, Select, Spin } from 'antd'

import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout'
import LessonCalendar from 'components/cards/LessonCalendar/LessonCalendar'
import { schoolContext } from 'utils/contexts/schoolContext'
import { withAuth, authContext } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'


const CalendarPage = () => {
    const [location, setLocation] = useState(null)

    const { school, schoolLoading } = useContext(schoolContext)
    const { user, userLoading } = useContext(authContext)

    const singleLocation = school?.locations?.length === 1
    const isSchoolAdmin = user.role === USER_ROLES.SCHOOL_ADMIN.tag
    const showPageHeaderExtra = !isSchoolAdmin && schoolLoading && userLoading ? false : singleLocation ? false : true

    const handleSelectLocation = selectedLocationID => {
        setLocation(school?.locations.find(location => location._id === selectedLocationID))
    }

    const pageHeaderExtra = (
        <Select value={location?._id} onChange={handleSelectLocation} style={{ width: 200 }}>
            {(school?.locations || []).map(location => (
                <Select.Option value={location._id} key={location._id}>{location.name}</Select.Option>
            ))}
        </Select>
    )

    useEffect(() => {
        if (school && isSchoolAdmin) setLocation(school.locations[0])
    }, [school])

    useEffect(() => {
        if (user && user.location) setLocation(user.location)
    }, [user])

    return (
        <DashboardLayout title="Calendar" pageHeaderExtra={showPageHeaderExtra ? pageHeaderExtra : null}>
            {/* <DashboardLayout title="Calendar" pageHeaderExtra={singleLocation ? null : pageHeaderExtra}> */}
            {schoolLoading
                ? <Row justify="center"><Spin /></Row>
                : <Row gutter={8}>
                    {/* Lesson requests */}
                    <Col xs={24} md={6}>
                        <p>Lesson requests</p>
                    </Col>
                    {/* Calendar */}
                    <Col xs={24} md={18}>
                        {/* TODO: create a search bar in the top for the school admin, so that he can search for specific locations' lessons calendar. */}
                        {/* If the school only has one location, don't show the search bar. */}
                        <LessonCalendar location={location} />
                    </Col>
                </Row>
            }
        </DashboardLayout>
    )
}

export default withAuth(CalendarPage)