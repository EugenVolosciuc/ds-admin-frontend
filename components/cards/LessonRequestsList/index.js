import React, { useState } from 'react'
import { Card, List, Empty } from 'antd'
import useSWR from 'swr'

import isEmpty from 'lodash/isEmpty'
import fetcher from 'utils/functions/fetcher'
import LessonRequest from 'components/cards/LessonRequest'

const LessonRequestsList = ({ location }) => {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(15)
    const [sortBy, setSortBy] = useState({})

    const url = '/lesson-requests'

    const { data, error, isValidating } = useSWR([url, page, perPage, sortBy, location], () => fetcher(url, {
        filters: {
            location: location?._id
        },
        sortBy,
        page,
        perPage
    }))

    const lessonRequestCards = (
        <List
            dataSource={data?.lessonrequests}
            renderItem={item => (
                <List.Item>
                    <LessonRequest lesson={item} />
                </List.Item>
            )}
        >

        </List>
    )

    console.log("DATA", data)

    return (
        <Card title={<span className="bold">Lesson requests</span>}>
            {isEmpty(data?.lessonrequests)
                ? <Empty description="No lesson requests" />
                : lessonRequestCards
            }
        </Card>
    )
}

export default LessonRequestsList
