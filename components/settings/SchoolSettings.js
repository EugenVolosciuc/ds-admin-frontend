import React, { useState } from 'react'
import { Card, Row, Col, Typography, Menu } from 'antd'

import {
    SchoolGeneralSettings,
    ExamSettings
} from 'components/settings/categories'

const categories = {
    General: {
        label: 'General',
        component: SchoolGeneralSettings
    },
    Exams: {
        label: 'Exams',
        component: ExamSettings
    }
}

const SchoolSettings = () => {
    const [shownCategory, setShownCategory] = useState('General')

    const Category = categories[shownCategory].component

    return (
        <Card>
            <Row gutter={[24, 24]}>
                <Col span={6}>
                    <Menu className="settings-menu" defaultSelectedKeys={['General']}>
                        {Object.values(categories).map(category => {
                            return <Menu.Item key={`${category.label}`} onClick={item => setShownCategory(item.key)}>
                                <Typography.Text className="bold">{category.label}</Typography.Text>
                            </Menu.Item>
                        })}
                    </Menu>
                </Col>
                <Col span={18}><Category /></Col>
            </Row>
        </Card>
    )
}

export default SchoolSettings
