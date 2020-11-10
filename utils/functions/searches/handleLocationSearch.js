import debounce from 'lodash/debounce'
import axios from 'axios'

const handleLocationSearch = debounce(async (value, setIsLoading, auth, setLocationOptions, form) => {
    if (value.length > 2) {
        try {
            setIsLoading('locations')
            const { data } = await axios.get('/locations/search', {
                params: {
                    search: { name: value },
                    school: auth.user.school._id
                }
            })

            setLocationOptions({
                locationNames: data.map(location => ({ value: location.name })),
                locationNamesandIDs: data.map(location => ({ id: location._id, name: location.name }))
            })

            form.setFieldsValue({ locationID: undefined })
        } catch (error) {
            console.log("Error searching for locations", error)
        }

        setIsLoading(false)
    }
}, 500)

export default handleLocationSearch