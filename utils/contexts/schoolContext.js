import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

import { authContext } from 'utils/hoc/withAuth'

export const schoolContext = createContext({ school: null, schoolLoading: false })

const ProvideSchool = ({ children }) => {
    const [school, setSchool] = useState(null)
    const [isLoading, setIsLoading] = useState(null)

    const auth = useContext(authContext)

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true)
                if (auth.user?.school) {
                    const { data } = await axios.get(`/schools/${auth.user.school._id}`)

                    setSchool(data)
                    setIsLoading(false)
                }

                if (!auth.user && school) setSchool(null)
            } catch (error) {
                setIsLoading(false)
                console.log("ERROR FETCHING SCHOOL", error)
            }
        })()
    }, [auth.user])

    return <schoolContext.Provider value={{ school, schoolLoading: isLoading }}>{children}</schoolContext.Provider>
}

export default ProvideSchool