// https://usehooks.com/useAuth/
// https://jolvera.dev/posts/user-authentication-with-nextjs
// https://dev.to/justincy/client-side-and-server-side-redirection-in-next-js-3ile
import React, { useState, useEffect, useContext, createContext } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import cookies from 'next-cookies'
import USER_ROLES from 'constants/USER_ROLES'

export const authContext = createContext({ user: null, userLoading: false })
const isBrowser = typeof window !== 'undefined'

export const ProvideAuth = ({ children }) => {
    const auth = useProvideAuth()
    return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

// authOption: false | userRole | userRole[]
// false - user shouldn't see the page if false
// undefined - user should be logged in to see the page, regardless of the user role
// userRole - string or array of strings of user role that can see the page
export const withAuth = (Component, authOption) => {
    const WithAuthWrapper = props => {
        const router = useRouter()
        const { user, userLoading } = useContext(authContext)

        if (userLoading) return <p>Loading...</p>

        if (authOption === false && !user) return <Component {...props} />

        // if (authOption === false && !user && !userLoading) {
        //     return <Component {...props} />
        // }

        if (user) {
            const needRedirect = () => {
                if (authOption === false) {
                    return true
                } else {
                    if (Array.isArray(authOption)) {
                        if (!authOption.includes(user.role)) return true
                    } else if (typeof authOption == 'string') {
                        if (authOption !== user.role) return true
                    }
                }

                return false
            }

            if (isBrowser && needRedirect()) {
                router.push('/', '/')
                return <></>
            }

            return <Component {...props} />
        }

        return <p>Loading...</p>
    }

    WithAuthWrapper.getInitialProps = async (ctx) => {
        const { token } = cookies(ctx)

        if (!isBrowser && ctx.res) {
            if ((!token && authOption !== false) || (!!token && authOption === false)) {
                ctx.res.writeHead(302, { Location: '/' })
                ctx.res.end()
                return { error: 'Not logged in' }
            }
        }

        const componentProps =
            Component.getInitialProps &&
            (await Component.getInitialProps(ctx))

        return { ...componentProps, token }
    };

    return WithAuthWrapper
}

const useProvideAuth = () => {
    const [user, setUser] = useState()
    const [userLoading, setUserLoading] = useState(false)
    const router = useRouter()

    const redirectURLs = loggedUser => {
        switch (loggedUser.role) {
            case USER_ROLES.SUPER_ADMIN.tag:
                return {
                    href: '/app/admin',
                    as: '/app/admin'
                }
            case USER_ROLES.SCHOOL_ADMIN.tag:
                return {
                    href: '/app/schools/[school_id]',
                    as: `/app/schools/${loggedUser.school._id}`
                }
            case USER_ROLES.LOCATION_ADMIN.tag:
                return {
                    href: `/app/schools/${null}`,
                    as: `/app/schools/${loggedUser.school._id}`
                }
            case USER_ROLES.INSTRUCTOR.tag:
                return {
                    href: '/app/schools/[school_id/calendar',
                    as: `/app/schools/${loggedUser.school._id}/calendar`
                }
            case USER_ROLES.STUDENT.tag:
                return {
                    href: '/app/schools/[school_id]/calendar',
                    as: `/app/schools/${loggedUser.school._id}/calendar`
                }
        }
    }

    // Login method
    const login = async values => {
        try {
            setUserLoading(true)
            const { data } = await axios.post('/users/login', values)
            setUser(data)
            setUserLoading(false)

            const urls = redirectURLs(data)
            router.push(urls.href, urls.as)
        } catch (error) {
            setUserLoading(false)
            console.log(error)
        }
    }

    // Register method

    // Logout method
    const logout = async () => {
        try {
            setUserLoading(true)
            await axios.post('/users/logout')
            setUser(null)
            setUserLoading(false)
            router.push('/')
        } catch (error) {
            setUserLoading(false)
            console.log(error)
        }
    }

    // Check auth
    const checkAuth = async () => {
        try {
            setUserLoading(true)
            const { data } = await axios.get('/users/me')
            setUser(data)
            setUserLoading(false)

            const urls = redirectURLs(data)
            router.push(urls.href, urls.as)
        } catch (error) {
            console.log("ERROR CHECKING AUTH", error)
            setUser(null)
            router.push('/')
            setUserLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    return {
        user,
        userLoading,
        login,
        logout
    }
}