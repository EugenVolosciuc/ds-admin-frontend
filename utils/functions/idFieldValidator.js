import isEmpty from 'lodash/isEmpty'

const idFieldValidator = (getFieldValue, nameField, idField, options, initialValues) => ({
    validator(rule, value) {
        const ids = options.map(option => option.id)
        const isUpdateModal = !isEmpty(initialValues)

        if (isUpdateModal ? value === initialValues[nameField] || ids.includes(getFieldValue(idField)) :  ids.includes(getFieldValue(idField))) {
            return Promise.resolve()
        }

        return Promise.reject(`Please provide a valid ${nameField}`)
    },
})

export default idFieldValidator