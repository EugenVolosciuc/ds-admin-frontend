import React from 'react'

import { withAuth } from 'utils/hoc/withAuth'
import LoginCard from 'components/cards/Login/Login'
import styles from 'styles/pages/login.module.css'

const Login = () => {
    return (
        <div className={styles['login-container']}>
            <LoginCard />
        </div>
    )
}

export default withAuth(Login, false)
