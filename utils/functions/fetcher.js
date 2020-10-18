import axios from 'axios'

const fetcher = async (url, params) => {
    try {
        const { data } = await axios.get(url, {
            params
        })

        return data
    } catch (error) {
        console.log(error)
    }
}

export default fetcher