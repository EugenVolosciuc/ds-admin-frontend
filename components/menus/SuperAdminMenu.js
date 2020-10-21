import React from 'react'
import { Menu } from 'antd'
import {
    DashboardOutlined,
    UserOutlined,
    HomeOutlined,
    DollarCircleOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/router'

import { Link } from 'i18n'

const SuperAdminMenu = () => {
    const router = useRouter()

    return (
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[router.route]}>
            <Menu.Item key="/app/dashboard" icon={<DashboardOutlined />}>
                <Link href="/app/dashboard" as="/app/dashboard"><a>Dashboard</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/users" icon={<UserOutlined />}>
                <Link href="/app/users" as="/app/users"><a>Users</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/schools" icon={<HomeOutlined />}>
                <Link href="/app/schools" as="/app/schools"><a>Schools</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/finances" icon={<DollarCircleOutlined />}>
                <Link href="/app/finances" as="/app/finances"><a>Finances</a></Link>
            </Menu.Item>
        </Menu>
    )
}

export default SuperAdminMenu
