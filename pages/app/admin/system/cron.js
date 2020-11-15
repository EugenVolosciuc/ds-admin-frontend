import React, { useState } from 'react'
import useSWR from 'swr'
import { Row, Col, Table, Button, message } from 'antd'
import axios from 'axios'
import Router from 'next/router'

import { withAuth } from 'utils/hoc/withAuth'
import DashboardLayout from 'components/layouts/DashboardLayout/DashboardLayout.js'
import USER_ROLES from 'constants/USER_ROLES'
import fetcher from 'utils/functions/fetcher'
import errorHandler from 'utils/functions/errorHandler'

const CronJobs = () => {
    const [isLoading, setIsLoading] = useState(false)
    const url = '/cron'

    const { data, isValidating } = useSWR([url], () => fetcher(url))

    const handleCronJobChange = async (name, action) => {
        try {
            setIsLoading(`${name}-${action}`)
            await axios.post('/cron', { name, action})
            setIsLoading(false)
            message.success(`Cron job ${action}ed`)
            Router.reload()
        } catch (error) {
            setIsLoading(false)
            errorHandler(error)
        }
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status'
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            render: (actions, record) => {
                return <Row gutter={8}>
                    {record.status === 'scheduled'
                        ? <>
                            <Col>
                                <Button 
                                    onClick={() => handleCronJobChange(record.name, 'stop')}
                                    loading={isLoading === `${record.name}-stop`} 
                                    disabled={isLoading}
                                    danger>
                                    Stop
                                </Button>
                            </Col>
                        </>
                        : <>
                            <Col>
                                <Button 
                                    type="primary" 
                                    loading={isLoading === `${record.name}-start`}
                                    disabled={isLoading}
                                    onClick={() => handleCronJobChange(record.name, 'start')}>
                                    Start
                                </Button>
                            </Col>
                        </>
                    }
                </Row>
            }
        },
    ]

    return (
        <DashboardLayout title="Cron jobs">
            <Table
                rowKey="name"
                loading={isValidating}
                columns={columns}
                dataSource={data}
            />
        </DashboardLayout>
    )
}

export default withAuth(
    CronJobs,
    USER_ROLES.SUPER_ADMIN.tag
)