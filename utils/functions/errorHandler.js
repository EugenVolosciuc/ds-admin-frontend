import { message } from 'antd'

const errorHandler = error => {
    // TODO: check the statusCode as well
    if (error.response) {
        message.error(error.response.data.message)
    } else if (error.request) {
        console.log("Request error", error.request)
    } else {
        console.log("App error", error)
    }
}

export default errorHandler