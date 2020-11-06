import React, { useState } from 'react'
import { Card } from 'antd'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'

import CreateEditLessonModal from 'components/modals/CreateEditLessonModal'

const localizer = momentLocalizer(moment)

const LessonCalendar = ({ handleSelect = () => null }) => {
    const [lessons, setLessons] = useState([])
    const [showCreateLessonModal, setShowCreateLessonModal] = useState(false) // can be true, false or a date string

    const toggleCreateLessonModal = () => setShowCreateLessonModal(!showCreateLessonModal)

    return (
        <Card className="hide-calendar-mode-selector">
            {/* Create Lesson Modal */}
            <CreateEditLessonModal visible={showCreateLessonModal} onCancel={toggleCreateLessonModal} />

            <Calendar
                localizer={localizer}
                events={lessons}
                // startAccessor="start"
                // endAccessor="end"
                // style={{ height: 500 }}
            />
        </Card>
    )
}

export default LessonCalendar
