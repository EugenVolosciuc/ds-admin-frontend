import React, { useState, useContext, useEffect } from 'react'
import { Layout, Menu, Dropdown, PageHeader } from 'antd'
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    DownOutlined
} from '@ant-design/icons'

import styles from './DashboardLayout.module.css'
import { authContext } from 'utils/hoc/withAuth'
import MainMenu from 'components/menus/MainMenu'

const { Header, Sider, Content } = Layout

const DashboardLayout = ({ children, title, pageHeaderExtra }) => {

    const [siderIsCollapsed, setSiderIsCollapsed] = useState(false)

    const { user, logout } = useContext(authContext)

    const toggleSider = () => setSiderIsCollapsed(!siderIsCollapsed)

    useEffect(() => {
        const abortController = new AbortController() // to stop the infinite loop
        const data = localStorage.getItem('toogleSider')

        console.log(data)
        if (data) {
            setSiderIsCollapsed(JSON.parse(data)) 
        }
        return function cancel() {
            abortController.abort();
        }
    }, [setSiderIsCollapsed])

    useEffect(() => {
        localStorage.setItem('toogleSider', JSON.stringify(siderIsCollapsed))
    })

    const menu = (
        <Menu triggerSubMenuAction="click">
            <Menu.Item>
                <span onClick={logout}>
                    Logout
                </span>
            </Menu.Item>
        </Menu>
    )

    return (
        <div className="h-screen">
            <Layout className={`h-full ${styles.dashboardLayout}`}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={siderIsCollapsed}
                    style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                    }}
                >
                    <h2 className={styles.logo}>{siderIsCollapsed ? 'DS' : 'DS Admin'}</h2>
                    <MainMenu />
                </Sider>
                <Layout>
                    <Header style={{ padding: 0, marginLeft: siderIsCollapsed ? 80 : 200 }} className={styles.header}>
                        <div className={styles['header-inner']}>
                            {siderIsCollapsed
                                ? <MenuUnfoldOutlined className={styles.trigger} onClick={toggleSider} />
                                : <MenuFoldOutlined className={styles.trigger} onClick={toggleSider} />
                            }
                            <Dropdown overlay={menu}>
                                <a className={styles.dropdown}>{user.lastName} {user.firstName} <DownOutlined /></a>
                            </Dropdown>
                        </div>
                    </Header>
                    <PageHeader 
                        className={styles['page-header']}
                        style={{ marginLeft: siderIsCollapsed ? 80 : 200 }}
                        title={title}
                        extra={pageHeaderExtra}
                    />
                    <Content
                        style={{ marginLeft: siderIsCollapsed ? 80 : 200 }}
                        className={styles.content}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </div>
    )
}

export default DashboardLayout