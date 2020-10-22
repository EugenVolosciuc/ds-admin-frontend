import axios from 'axios'

axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'
axios.defaults.withCredentials = true