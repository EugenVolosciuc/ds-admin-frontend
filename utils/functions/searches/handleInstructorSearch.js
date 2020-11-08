import debounce from 'lodash/debounce'
import axios from 'axios'

import USER_ROLES from 'constants/USER_ROLES'

const handleInstructorSearch = debounce(async (value, setIsLoading, auth, setInstructorOptions) => {
    if (value.length > 2) {
        try {
            setIsLoading('instructors')
            const { data } = await axios.get('/users/search', {
                params: {
                    search: { lastName: value }, // TODO: somehow check firstname as well
                    school: auth.user.school._id,
                    role: [USER_ROLES.INSTRUCTOR.tag, USER_ROLES.SCHOOL_ADMIN.tag, USER_ROLES.LOCATION_ADMIN.tag]
                }
            })

            setInstructorOptions({
                instructorNames: data.map(instructor => ({ value: `${instructor.lastName} ${instructor.firstName}` })),
                instructorNamesandIDs: data.map(instructor => ({ id: instructor._id, name: `${instructor.lastName} ${instructor.firstName}` }))
            })
        } catch (error) {
            console.log("Error searching for instructors", error)
        }

        setIsLoading(false)
    }
}, 500)

export default handleInstructorSearch