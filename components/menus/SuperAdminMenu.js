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
            <Menu.Item key="/app/admin" icon={<DashboardOutlined />}>
                <Link href="/app/admin" as="/app/admin"><a>Dashboard</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/admin/users" icon={<UserOutlined />}>
                <Link href="/app/admin/users" as="/app/admin/users"><a>Users</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/admin/schools" icon={<HomeOutlined />}>
                <Link href="/app/admin/schools" as="/app/admin/schools"><a>Schools</a></Link>
            </Menu.Item>
            <Menu.Item key="/app/admin/finances" icon={<DollarCircleOutlined />}>
                <Link href="/app/admin/finances" as="/app/admin/finances"><a>Finances</a></Link>
            </Menu.Item>
        </Menu>
    )
}

export default SuperAdminMenu
