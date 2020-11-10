const idFieldValidator = (getFieldValue, nameField, idField, options) => ({
    validator(rule, value) {
        const ids = options.map(option => option.id)

        if (ids.includes(getFieldValue(idField))) {
            return Promise.resolve()
        }

        return Promise.reject(`Please provide a valid ${nameField}`)
    },
})

export default idFieldValidator