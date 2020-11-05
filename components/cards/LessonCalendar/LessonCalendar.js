import React from 'react'
import { Card, Calendar } from 'antd'

const LessonCalendar = ({ handleSelect = () => null }) => {
    return (
        <Card className="hide-calendar-mode-selector">
            <Calendar onSelect={handleSelect} />
        </Card>
    )
}

export default LessonCalendar
