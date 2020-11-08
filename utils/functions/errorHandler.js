import { message } from 'antd'

const errorHandler = error => {
    // TODO: check the statusCode as well
    if (error.response) {
        const { data, statusText } = error.response
        message.error(data.errors || data.message || statusText)
    } else if (error.request) {
        console.log("Request error", error.request)
    } else {
        console.log("App error", error)
    }
}

export default errorHandler