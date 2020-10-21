import React from 'react'
import { Menu } from 'antd'
import {
    DashboardOutlined,
    TeamOutlined,
    BookOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { useRouter } from 'next/router'

const SuperAdminMenu = () => {
    const router = useRouter()

    return (
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[router.route]}>
            <Menu.Item key="/app/dashboard" icon={<DashboardOutlined />}>
                <Link href="/app/dashboard" as="/app/dashboard"><a>Dashboard</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/instructors" icon={<TeamOutlined />}>
                <Link href="/app/instructors" as="/app/instructors"><a>Instructors</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/students" icon={<BookOutlined />}>
                <Link href="/app/students" as="/app/students"><a>Students</a></Link>
            </Menu.Item>
        </Menu>
    )
}

export default SuperAdminMenu
