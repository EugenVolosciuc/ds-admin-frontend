import React, { useState, useEffect } from 'react'
import { Row, Col, Slider } from 'antd'

const ZOOM_LEVELS = {
    1: 40,
    2: 60,
    3: 80
}

const changeCalendarCellZoomStyle = value => {
    const elements = document.querySelectorAll('.rbc-timeslot-group')

    for (let i = 0; i < elements.length; i++) {
        elements[i].style.minHeight = `${ZOOM_LEVELS[value]}px`
    }
}

const CalendarZoomSlider = () => {
    const [zoomLevel, setZoomLevel] = useState(1)

    const handleZoomChange = value => {
        setZoomLevel(value)
        localStorage.setItem('calendarZoomLevel', value)
        changeCalendarCellZoomStyle(value)
    }

    useEffect(() => {
        const localStorageZoomLevel = localStorage.getItem('calendarZoomLevel')
        if (localStorageZoomLevel) {
            setZoomLevel(localStorageZoomLevel)
            changeCalendarCellZoomStyle(localStorageZoomLevel)
        }
    }, [])

    return (
        <Row align="middle" style={{ maxWidth: 400, marginLeft: 'auto' }}>
            <Col span={7}>
                <div className="bold w-full text-right">Zoom level:</div>
            </Col>
            <Col span={16} offset={1}>
                <Slider min={1} max={3} onChange={handleZoomChange} value={zoomLevel} />
            </Col>
        </Row>
    )
}

export default CalendarZoomSlider
