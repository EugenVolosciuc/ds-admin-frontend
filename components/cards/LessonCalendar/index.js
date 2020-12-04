import React, { useState, useEffect, useContext } from 'react'
import { Card, message, Row, Col, Checkbox } from 'antd'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import useSWR from 'swr'
import axios from 'axios'

import fetcher from 'utils/functions/fetcher'
import CreateEditLessonModal from 'components/modals/CreateEditLessonModal'
import CreateLessonOrExamModal from 'components/modals/CreateLessonOrExamModal'
import USER_ROLES from 'constants/USER_ROLES'
import { authContext } from 'utils/hoc/withAuth'
import getLessonTitle from 'utils/functions/getLessonTitle'
import CalendarZoomSlider from 'components/cards/LessonCalendar/CalendarZoomSlider'
import EventTypeSetter from 'components/cards/LessonCalendar/EventTypeSetter'

const localizer = momentLocalizer(moment)

const CALENDAR_STEP = 30

const eventClasses = {
    lessons: 'lesson-event',
    lessonRequests: 'lesson-request-event',
    exams: 'exam-event',
}

const LessonCalendar = ({ location }) => {
    const [eventTypes, setEventTypes] = useState(['lessons'])
    const [showCreateLessonModal, setShowCreateLessonModal] = useState(false) // can be true, false or range
    const [showUpdateLessonModal, setShowUpdateLessonModal] = useState(null)
    const [showCreateLessonOrExamModal, setShowCreateLessonOrExamModal] = useState(false) // can be true, false or range
    const [calendarRangeStart, setCalendarRangeStart] = useState(moment().toDate())
    const [view, setView] = useState('week')
    const [examTypes, setExamTypes] = useState([])

    const { user } = useContext(authContext)

    const url = '/calendar'

    const { data, error, isValidating } = useSWR([url, calendarRangeStart, view, eventTypes, location?._id], () => fetcher(url, {
        filters: {
            startAt: calculateCalendarRange('start'),
            endAt: calculateCalendarRange('end'),
            location: location?._id,
            eventTypes
        }
    }))

    const toggleCreateLessonModal = () => setShowCreateLessonModal(!showCreateLessonModal)
    const toggleCreateLessonOrExamModal = () => setShowCreateLessonOrExamModal(!showCreateLessonOrExamModal)

    const toggleUpdateLessonModal = id => {
        if (id) return setShowUpdateLessonModal(id)

        return setShowUpdateLessonModal(null)
    }

    const handleSelectSlot = range => {
        // Only instructors are prohibited to schedule events at the same time
        if (user.role === USER_ROLES.INSTRUCTOR.tag) {
            // Only check if event exists in selection if the selection > calendar step
            const selectionIsBiggerThanCalendarStep = moment.duration(moment(range.end).diff(moment(range.start))).asMinutes() > CALENDAR_STEP

            if (selectionIsBiggerThanCalendarStep) {
                const twoEventsAtTheSameTime = data.some(event => {
                    if (moment(event.start).isSame(range.start, 'day')) {
                        return moment(event.start).isAfter(range.start) && moment(event.start).isBefore(range.end)
                    }

                    return false
                })

                if (twoEventsAtTheSameTime) return message.warn("You can't have two events at the same time")
            }
        }

        switch (user.role) {
            case USER_ROLES.SCHOOL_ADMIN.tag:
            case USER_ROLES.LOCATION_ADMIN.tag:
            case USER_ROLES.INSTRUCTOR.tag:
                return setShowCreateLessonOrExamModal(range)
            case USER_ROLES.STUDENT.tag:
                return setShowCreateLessonModal(range)
            default:
                return
        }
    }

    const handleSelectEvent = event => setShowUpdateLessonModal(event.resource.id)
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

    const transformAPIResponseToArrayOfEvents = () => {
        if (data) {
            const events = Object.entries(data).map(value => {
                const events = []
                for (let eventIndex = 0; eventIndex < value[1].length; eventIndex++) {
                    value[1][eventIndex].type = value[0]
                    events.push(value[1][eventIndex])
                }

                return events
            })

            return events.flat()
        } else return []
    }

    const events = transformAPIResponseToArrayOfEvents()

    const getEventsForCalendar = () => {
        if (data) {
            return events.map(event => ({
                title: getLessonTitle(event, user.role),
                start: new Date(event.start),
                end: new Date(event.end),
                resource: {
                    id: event._id,
                    type: event.type
                }
            }))
        } else return []
    }

    useEffect(() => {
        (async () => {
            const { data } = await axios.get('/exam-types', {
                params: {
                    filters: {
                        school: user.school._id
                    }
                }
            })

            setExamTypes(data)
        })()
    }, [])

    return (
        <Card
            title={<span className="bold">Events</span>}
            className="hide-calendar-mode-selector big-extra"
        >
            {/* Create Lesson Modal */}
            {showCreateLessonModal &&
                <CreateEditLessonModal visible={showCreateLessonModal} onCancel={toggleCreateLessonModal} />
            }

            {/* Update Lesson Modal */}
            {showUpdateLessonModal &&
                <CreateEditLessonModal
                    visible={showUpdateLessonModal}
                    onCancel={toggleUpdateLessonModal}
                    lesson={events?.find(event => event._id === showUpdateLessonModal)}
                />
            }

            {/* Create Lesson or Exam Modal (School admin, Location admin and instructor) */}
            {showCreateLessonOrExamModal &&
                <CreateLessonOrExamModal visible={showCreateLessonOrExamModal} onCancel={toggleCreateLessonOrExamModal} examTypes={examTypes} />
            }
            <Row align="middle" style={{ paddingBottom: 24 }}>
                <Col span={12}>
                    <EventTypeSetter eventTypes={eventTypes} setEventTypes={setEventTypes} />
                </Col>
                <Col span={12}>
                    <CalendarZoomSlider />
                </Col>
            </Row>

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
                eventPropGetter={(event) => ({ className: eventClasses[event.resource.type] })}
            />
        </Card>
    )
}

export default LessonCalendar
