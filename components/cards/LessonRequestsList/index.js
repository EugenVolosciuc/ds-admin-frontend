import React, { useState, useContext } from 'react'
import { Card, List, Empty } from 'antd'
import useSWR from 'swr'

import isEmpty from 'lodash/isEmpty'
import fetcher from 'utils/functions/fetcher'
import LessonRequest from 'components/cards/LessonRequest'
import { authContext } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'

const PER_PAGE = 5

const LessonRequestsList = ({ location }) => {
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState({})

    const { user } = useContext(authContext)

    const url = '/lesson-requests'

    const { data, error, isValidating } = useSWR([url, page, PER_PAGE, sortBy, location], () => fetcher(url, {
        filters: {
            location: location?._id,
            ...(user.role === USER_ROLES.INSTRUCTOR.tag && { instructor: user._id })
        },
        sortBy,
        page,
        perPage: PER_PAGE
    }))

    const lessonRequestCards = (
        <List
            dataSource={data?.lessonrequests}
            loading={isValidating}
            pagination={{
                pageSize: PER_PAGE,
                total: data?.totalItems,
                current: page,
                onChange(page) {
                    setPage(page)
                }
            }}
            renderItem={item => (
                <List.Item>
                    <LessonRequest lesson={item} />
                </List.Item>
            )}
        >

        </List>
    )

    return (
        <Card title={<span className="bold">Lesson requests</span>}>
            {isEmpty(data?.lessonrequests) && !isValidating
                ? <Empty description="No lesson requests" />
                : lessonRequestCards
            }
        </Card>
    )
}

export default LessonRequestsList
