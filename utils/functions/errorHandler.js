import { message } from 'antd'

const errorHandler = (error, form) => {
    // TODO: check the statusCode as well

    if (error.response) {
        const { data, status, statusText } = error.response

        if (status === 400) {
            if (form) {
                const errors = data.errors.map(error => ({ name: error.field, errors: [error.message] }))

                form.setFields(errors)
            } else console.error("Got validation error, but no form was provided in errorHandler", error.response)
        } else message.error(data.errors || data.message || statusText)
    } else if (error.request) {
        console.log("Request error", error.request)
    } else console.log("App error", error)
}

export default errorHandler