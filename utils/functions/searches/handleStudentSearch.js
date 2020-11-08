import debounce from 'lodash/debounce'
import axios from 'axios'

import USER_ROLES from 'constants/USER_ROLES'

const handleStudentSearch = debounce(async (value, setIsLoading, auth, setStudentOptions) => {
    if (value.length > 2) {
        try {
            setIsLoading('students')
            const { data } = await axios.get('/users/search', {
                params: {
                    search: { lastName: value }, // TODO: somehow check firstname as well
                    school: auth.user.school._id,
                    role: USER_ROLES.STUDENT.tag
                }
            })

            setStudentOptions({
                studentNames: data.map(student => ({ value: `${student.lastName} ${student.firstName}` })),
                studentNamesandIDs: data.map(student => ({ id: student._id, name: `${student.lastName} ${student.firstName}` }))
            })
        } catch (error) {
            console.log("Error searching for students", error)
        }

        setIsLoading(false)
    }
}, 500)

export default handleStudentSearch