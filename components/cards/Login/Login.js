import React, { useContext } from 'react'
import { Card, Form, Input, Button } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

import { authContext } from 'utils/hoc/withAuth'
import styles from './Login.module.css'

const LoginCard = () => {
    const { login } = useContext(authContext)

    return (
        <Card className={styles['login-card']}>
            <h2 className={styles['card-title']}>Login</h2>
            <Form
                name="normal_login"
                initialValues={{ remember: true }}
                onFinish={login}
            >
                <Form.Item
                    name="phoneNumber"
                    rules={[{ required: true, message: 'Please input your phone number' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Phone number" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password' }]}
                >
                    <Input
                        prefix={<LockOutlined />}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Log in
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}

export default LoginCard
