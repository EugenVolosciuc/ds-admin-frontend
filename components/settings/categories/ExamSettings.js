import React, { useContext } from 'react'
import { Row, Col, Typography, List, Spin, Empty, Button, Form, Checkbox } from 'antd'
import useSWR from 'swr'
import isEmpty from 'lodash/isEmpty'

import { schoolContext } from 'utils/contexts/schoolContext'
import fetcher from 'utils/functions/fetcher'

const ExamSettings = () => {
    const { school } = useContext(schoolContext)

    const url = '/exam-types'

    const { data, isValidating } = useSWR([url], () => fetcher(url, {
        filters: {
            school: school?._id
        }
    }))

    console.log("data!", data)

    return (
        <Row>
            <Col xs={24} lg={12}>
                <Typography.Title level={5}>General exam settings</Typography.Title>
                <Typography.Paragraph>General exam settings</Typography.Paragraph>
                <Button type="primary" style={{ marginTop: 8 }} disabled>Save changes</Button>
            </Col>
            <Col xs={24} lg={12}>
                <Typography.Title level={5}>List of exam types</Typography.Title>
                {isValidating
                    ? <Row justify="center"><Spin /></Row>
                    : isEmpty(data)
                        ? <Typography.Paragraph>No exam types found. Create one now so that you can schedule exams for your school.</Typography.Paragraph>
                        : null
                }

                <Button type="primary" style={{ marginTop: 8 }}>Create exam type</Button>
            </Col>
        </Row>
    )
}

export default ExamSettings
