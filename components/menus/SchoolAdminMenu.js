import React, { useContext } from 'react'
import { Menu } from 'antd'
import {
    DashboardOutlined,
    TeamOutlined,
    BookOutlined,
    PushpinOutlined,
    CalendarOutlined,
    CarOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/router'

import { Link } from 'i18n'
import { authContext } from 'utils/hoc/withAuth'

const SchoolAdminMenu = () => {
    const router = useRouter()

    const { user } = useContext(authContext)

    return (
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[router.route]}>
            <Menu.Item key="/app/schools/[school_id]" icon={<DashboardOutlined />}>
                <Link href="/app/schools/[school_id]" as={`/app/schools/${user.school._id}`}><a>Dashboard</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/schools/[school_id]/instructors" icon={<TeamOutlined />}>
                <Link href="/app/schools/[school_id]/instructors" as={`/app/schools/${user.school._id}/instructors`}><a>Instructors</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/schools/[school_id]/students" icon={<BookOutlined />}>
                <Link href="/app/schools/[school_id]/students" as={`/app/schools/${user.school._id}/students`}><a>Students</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/schools/[school_id]/locations" icon={<PushpinOutlined />}>
                <Link href="/app/schools/[school_id]/locations" as={`/app/schools/${user.school._id}/locations`}><a>Locations</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/schools/[school_id]/vehicles" icon={<CarOutlined />}>
                <Link href="/app/schools/[school_id]/vehicles" as={`/app/schools/${user.school._id}/vehicles`}><a>Vehicles</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/schools/[school_id]/calendar" icon={<CalendarOutlined />}>
                <Link href="/app/schools/[school_id]/calendar" as={`/app/schools/${user.school._id}/calendar`}><a>Calendar</a></Link>
            </Menu.Item>
        </Menu>
    )
}

export default SchoolAdminMenu
