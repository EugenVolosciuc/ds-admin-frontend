import React, { useContext } from 'react'
import { Menu } from 'antd'
import {
    DashboardOutlined,
    CalendarOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'

import { Link } from 'i18n'
import { authContext } from 'utils/hoc/withAuth'

const InstructorMenu = () => {
    const router = useRouter()

    const { user } = useContext(authContext)

    const hasNoLocation = !user.location

    return (
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[router.route]}>
            <Menu.Item key="/app/schools/[school_id]" icon={<DashboardOutlined />}>
                <Link href="/app/schools/[school_id]" as={`/app/schools/${user.school._id}`}><a>Dashboard</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/schools/[school_id]/calendar" icon={<CalendarOutlined />} disabled={hasNoLocation}>
                <Link href="/app/schools/[school_id]/calendar" as={`/app/schools/${user.school._id}/calendar`}><a>Calendar</a></Link>
            </Menu.Item>
        </Menu>
    )
}

export default InstructorMenu
