/**
 * Render content if user has specified role
 * @param {*} defaultContent The default content to show
 * @param {*} roleBasedContent Object with the role as the key and the role based content as the value
 * @param {*} userRole The logged in user's role
 */
const renderRoleBasedContent = (defaultContent, roleBasedContent, userRole) => {
    const roles = Object.keys(roleBasedContent)

    if (roles.includes(userRole)) return roleBasedContent[userRole]
    return defaultContent
}

export default renderRoleBasedContent