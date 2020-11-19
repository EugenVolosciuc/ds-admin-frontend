import axios from 'axios'
import moment from 'moment'

axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'
axios.defaults.withCredentials = true
axios.defaults.params = {}

// axios.defaults.utcOffset = moment().utcOffset()
axios.interceptors.request.use(function (config) {
    config.params['utcOffset'] = moment().utcOffset()

    return config
})