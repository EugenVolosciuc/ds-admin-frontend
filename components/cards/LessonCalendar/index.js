import React, { useState, useEffect, useContext } from 'react'
import { Card, message, Slider, Row, Col } from 'antd'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import useSWR from 'swr'

import fetcher from 'utils/functions/fetcher'
import CreateEditLessonModal from 'components/modals/CreateEditLessonModal'
import USER_ROLES from 'constants/USER_ROLES'
import { authContext } from 'utils/hoc/withAuth'
import getLessonTitle from 'utils/functions/getLessonTitle'

const localizer = momentLocalizer(moment)

const CALENDAR_STEP = 30
const MARKS = {
    1: 'Small',
    2: 'Medium',
    3: 'Big'
}

const ZOOM_LEVELS = {
    1: 40,
    2: 60,
    3: 80
}

const LessonCalendar = ({ location }) => {
    const [showCreateLessonModal, setShowCreateLessonModal] = useState(false) // can be true, false or range
    const [showUpdateLessonModal, setShowUpdateLessonModal] = useState(null)
    const [calendarRangeStart, setCalendarRangeStart] = useState(moment().toDate())
    const [zoomLevel, setZoomLevel] = useState(1)
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

    const getEventsForCalendar = () => {
        if (data) {
            return data.map(lesson => ({
                title: getLessonTitle(lesson, user.role),
                start: new Date(lesson.start),
                end: new Date(lesson.end),
                resource: lesson._id
            }))
        } else return []
    }

    const changeCalendarCellZoomStyle = value => {
        const elements = document.querySelectorAll('.rbc-timeslot-group')

        for (let i = 0; i < elements.length; i++) {
            elements[i].style.minHeight = `${ZOOM_LEVELS[value]}px`
        }
    }

    const handleZoomChange = value => {
        setZoomLevel(value)
        localStorage.setItem('calendarZoomLevel', value)
        changeCalendarCellZoomStyle(value)
    }

    const calendarSlider = <Row align="middle" style={{ maxWidth: 400, marginLeft: 'auto' }}>
        <Col span={7}>
            <div className="bold w-full text-right">Zoom level:</div>
        </Col>
        <Col span={16} offset={1}>
            <Slider min={1} max={3} onChange={handleZoomChange} value={zoomLevel} />
        </Col>
    </Row>

    useEffect(() => {
        const localStorageZoomLevel = localStorage.getItem('calendarZoomLevel')
        if (localStorageZoomLevel) {
            setZoomLevel(localStorageZoomLevel)
            changeCalendarCellZoomStyle(localStorageZoomLevel)
        }
    }, [])

    return (
        <Card
            title={<span className="bold">Lessons</span>}
            extra={calendarSlider}
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
