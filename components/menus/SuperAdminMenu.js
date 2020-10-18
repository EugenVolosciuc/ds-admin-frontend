import React from 'react'
import { Menu } from 'antd'
import {
    DashboardOutlined,
    UserOutlined,
    HomeOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { useRouter } from 'next/router'

const SuperAdminMenu = () => {
    const router = useRouter()

    return (
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[router.route]}>
            <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
                <Link href="/dashboard" as="/dashboard"><a>Dashboard</a></Link>
            </Menu.Item>
            <Menu.Item key="/users" icon={<UserOutlined />}>
                <Link href="/users" as="/users"><a>Users</a></Link>
            </Menu.Item>
            <Menu.Item key="/schools" icon={<HomeOutlined />}>
                <Link href="/schools" as="/schools"><a>Schools</a></Link>
            </Menu.Item>
        </Menu>
    )
}

export default SuperAdminMenu
