import React, { useState, useContext } from 'react'
import { Card, message } from 'antd'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import useSWR from 'swr'

import fetcher from 'utils/functions/fetcher'
import CreateEditLessonModal from 'components/modals/CreateEditLessonModal'
import USER_ROLES from 'constants/USER_ROLES'
import { authContext } from 'utils/hoc/withAuth'
import nameShortener from 'utils/functions/nameShortener'

const localizer = momentLocalizer(moment)

const CALENDAR_STEP = 30

const LessonCalendar = ({ location }) => {
    const [showCreateLessonModal, setShowCreateLessonModal] = useState(false) // can be true, false or range
    const [showUpdateLessonModal, setShowUpdateLessonModal] = useState(null)
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
    
    const toggleCreateLessonModal = () => setShowCreateLessonModal(!showCreateLessonModal)

    const toggleUpdateLessonModal = id => {
        if (id) return setShowUpdateLessonModal(id)

        return setShowUpdateLessonModal(null)
    }

    const handleSelectSlot = range => {
        // Only instructors are prohibited to schedule lessons at the same time
        if (user.role === USER_ROLES.INSTRUCTOR.tag) {
            // Only check if lesson exists in selection if the selection > calendar step
            const selectionIsBiggerThanCalendarStep = moment.duration(moment(range.end).diff(moment(range.start))).asMinutes() > CALENDAR_STEP

            if (selectionIsBiggerThanCalendarStep) {
                const twoLessonsAtTheSameTime = data.some(lesson => {
                    if (moment(lesson.start).isSame(range.start, 'day')) {
                        return moment(lesson.start).isAfter(range.start) && moment(lesson.start).isBefore(range.end)
                    }

                    return false
                })

                if (twoLessonsAtTheSameTime) return message.warn("You can't have two lessons at the same time")
            }
        }

        setShowCreateLessonModal(range)
    }

    const handleSelectEvent = event => setShowUpdateLessonModal(event.resource)
    const handleRangeChange = range => setCalendarRangeStart(range[0])
    const handleNavigate = navigatedDate => setCalendarRangeStart(navigatedDate)
    const handleViewChange = newView => setView(newView)

    const calculateCalendarRange = extremity => {
        if (extremity == 'start') {
            switch (view) {
                case 'week':
                    return moment(calendarRangeStart).startOf('week')
                case 'day':
                default:
                    return moment(calendarRangeStart).startOf('day')
            }
        } else {
            switch (view) {
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

            {/* Update Lesson Modal */}
            {showUpdateLessonModal &&
                <CreateEditLessonModal
                    visible={showUpdateLessonModal}
                    onCancel={toggleUpdateLessonModal}
                    lesson={data?.find(lesson => lesson._id === showUpdateLessonModal)}
                />
            }

            <Calendar
                localizer={localizer}
                events={getEventsForCalendar()}
                view={view}
                date={calendarRangeStart}
                views={['day', 'week']}
                selectable={true}
                step={CALENDAR_STEP}
                onSelectSlot={handleSelectSlot}
                onRangeChange={handleRangeChange}
                onNavigate={handleNavigate}
                onView={handleViewChange}
                onSelectEvent={handleSelectEvent}
            />
        </Card>
    )
}

export default LessonCalendar
