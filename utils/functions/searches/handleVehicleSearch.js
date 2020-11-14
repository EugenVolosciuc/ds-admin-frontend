import debounce from 'lodash/debounce'
import axios from 'axios'

import VEHICLE_STATUSES from 'constants/VEHICLE_STATUSES'

const handleVehicleSearch = debounce(async (
    value,
    setIsLoading,
    auth,
    setVehicleOptions,
    form,
    status = [VEHICLE_STATUSES.IDLE.tag, VEHICLE_STATUSES.IN_LESSON.tag]
) => {
    if (value.length > 2) {
        try {
            setIsLoading('vehicles')
            const { data } = await axios.get('/vehicles/search', {
                params: {
                    search: { brand: value }, // TODO: somehow check other fields as well
                    school: auth.user.school._id,
                    status,
                    ...(auth.user.location && { location: auth.user.location._id })
                }
            })

            setVehicleOptions({
                vehicleNames: data.map(vehicle => ({ value: `${vehicle.brand} ${vehicle.model}` })),
                vehicleNamesandIDs: data.map(vehicle => ({ id: vehicle._id, name: `${vehicle.brand} ${vehicle.model}` }))
            })

            form.setFieldsValue({ vehicleID: undefined })
        } catch (error) {
            console.log("Error searching for vehicles", error)
        }

        setIsLoading(false)
    }
}, 500)

export default handleVehicleSearch