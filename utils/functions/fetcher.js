import axios from 'axios'

import errorHandler from './errorHandler'

const fetcher = async (url, params) => {
    try {
        const { data } = await axios.get(url, {
            params
        })

        return data
    } catch (error) {
        errorHandler(error)
    }
}

export default fetcher