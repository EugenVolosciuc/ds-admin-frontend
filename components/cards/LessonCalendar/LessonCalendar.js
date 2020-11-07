import React, { useState, useContext } from 'react'
import { Card } from 'antd'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import useSWR from 'swr'

import fetcher from 'utils/functions/fetcher'
import CreateEditLessonModal from 'components/modals/CreateEditLessonModal'
import USER_ROLES from 'constants/USER_ROLES'
import { authContext } from 'utils/hoc/withAuth'
import nameShortener from 'utils/functions/nameShortener'

const localizer = momentLocalizer(moment)

const exampleEvent = {
    title: "My first lesson",
    start: moment().subtract(1.5, 'hours').toDate(),
    end: moment().toDate(),
    // allDay: boolean,
    // resource: any,
}

const LessonCalendar = ({ location }) => {
    const [lessons, setLessons] = useState([exampleEvent]) // TODO: delete when useSWR will work properly
    const [showCreateLessonModal, setShowCreateLessonModal] = useState(false) // can be true, false or slotInfo
    const [calendarRangeStart, setCalendarRangeStart] = useState(moment().toDate())
    const [view, setView] = useState('week')

    const { user } = useContext(authContext)

    const url = '/lessons'

    const { data, error, isValidating } = useSWR([url, calendarRangeStart, view, location?._id], () => fetcher(url, {
        filters: {
            startAt: calculateCalendarRange('start'),
            endAt: calculateCalendarRange('end'),
            location: location?._id
        }
    }))

    console.log("DATA!!!", data)

    const toggleCreateLessonModal = () => setShowCreateLessonModal(!showCreateLessonModal)
    const handleSelectSlot = slotInfo => setShowCreateLessonModal(slotInfo)
    const handleRangeChange = range => setCalendarRangeStart(range[0])
    const handleNavigate = navigatedDate => setCalendarRangeStart(navigatedDate)
    const handleViewChange = newView => setView(newView)

    const calculateCalendarRange = extremity => {
        if (extremity == 'start') {
            switch(view) {
                case 'week':
                    return moment(calendarRangeStart).startOf('week')
                case 'day':
                default:
                    return moment(calendarRangeStart).startOf('day')
            }
        } else {
            switch(view) {
                case 'week':
                    return moment(calendarRangeStart).endOf('week')
                case 'day':
                default:
                    return moment(calendarRangeStart).endOf('day')
            }
        }
    }

    const getLessonTitle = lesson => {
        const { instructor, student, location, vehicle } = lesson

        switch (user.role) {
            case USER_ROLES.SCHOOL_ADMIN.tag:
                return `${nameShortener(student.lastName, student.firstName)} with ${nameShortener(instructor.lastName, instructor.firstName)} at ${location.name} - ${vehicle.brand} ${vehicle.model}`
            case USER_ROLES.LOCATION_ADMIN.tag:
                return `${nameShortener(student.lastName, student.firstName)} with ${nameShortener(instructor.lastName, instructor.firstName)} - ${vehicle.brand} ${vehicle.model}`
            case USER_ROLES.INSTRUCTOR.tag:
                return `${nameShortener(student.lastName, student.firstName)} - ${vehicle.brand} ${vehicle.model}`
            case USER_ROLES.STUDENT.tag:
                return `${nameShortener(instructor.lastName, instructor.firstName)} - ${vehicle.brand} ${vehicle.model}`
        }
    }

    const getEventsForCalendar = () => {
        if (data) {
            return data.map(lesson => ({
                title: getLessonTitle(lesson),
                start: new Date(lesson.start),
                end: new Date(lesson.end),
                resource: lesson._id
            }))
        } else return []
    }

    return (
        <Card className="hide-calendar-mode-selector">
            {/* Create Lesson Modal */}
            {showCreateLessonModal &&
                <CreateEditLessonModal visible={showCreateLessonModal} onCancel={toggleCreateLessonModal} />            
            }

            <Calendar
                localizer={localizer}
                events={getEventsForCalendar()}
                view={view}
                date={calendarRangeStart}
                views={['day', 'week']}
                selectable={true}
                onSelectSlot={handleSelectSlot}
                onRangeChange={handleRangeChange}
                onNavigate={handleNavigate}
                onView={handleViewChange}
            />
        </Card>
    )
}

export default LessonCalendar
