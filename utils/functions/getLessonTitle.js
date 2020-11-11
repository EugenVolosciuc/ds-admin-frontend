import nameShortener from 'utils/functions/nameShortener'
import USER_ROLES from 'constants/USER_ROLES'

const getLessonTitle = (lesson, userRole) => {
    const { instructor, student, location, vehicle } = lesson

    switch (userRole) {
        case USER_ROLES.SCHOOL_ADMIN.tag:
            return `${nameShortener(student.lastName, student.firstName)} with ${nameShortener(instructor.lastName, instructor.firstName)} at ${location.name} - ${vehicle.brand} ${vehicle.model}`
        case USER_ROLES.LOCATION_ADMIN.tag:
            return `${nameShortener(student.lastName, student.firstName)} with ${nameShortener(instructor.lastName, instructor.firstName)} - ${vehicle.brand} ${vehicle.model}`
        case USER_ROLES.INSTRUCTOR.tag:
            return `${nameShortener(student.lastName, student.firstName)} - ${vehicle.brand} ${vehicle.model}`
        case USER_ROLES.STUDENT.tag:
            return `${nameShortener(instructor.lastName, instructor.firstName)} - ${vehicle.brand} ${vehicle.model}`
    }
}

export default getLessonTitle