import React, { useState, useContext } from 'react'
import { Card, List, Empty, Checkbox } from 'antd'
import useSWR from 'swr'

import isEmpty from 'lodash/isEmpty'
import fetcher from 'utils/functions/fetcher'
import LessonRequest from 'components/cards/LessonRequest'
import { authContext } from 'utils/hoc/withAuth'
import USER_ROLES from 'constants/USER_ROLES'

const PER_PAGE = 5

const LessonRequestsList = ({ location }) => {
    const [page, setPage] = useState(1)
    const [filterRejected, setFilterRejected] = useState(false)

    const { user } = useContext(authContext)

    const url = '/lesson-requests'

    const { data, isValidating } = useSWR([url, page, PER_PAGE, location, filterRejected], () => fetcher(url, {
        filters: {
            location: location?._id,
            rejectionReason: filterRejected,
            ...(user.role === USER_ROLES.INSTRUCTOR.tag && { instructor: user._id })
        },
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

    const extra = (
        <Checkbox onChange={event => setFilterRejected(event.target.checked)}>Filter rejected</Checkbox>
    )

    return (
        <Card title={<span className="bold">Lesson requests</span>} extra={extra}>
            {isEmpty(data?.lessonrequests) && !isValidating
                ? <Empty description="No lesson requests" />
                : lessonRequestCards
            }
        </Card>
    )
}

export default LessonRequestsList
