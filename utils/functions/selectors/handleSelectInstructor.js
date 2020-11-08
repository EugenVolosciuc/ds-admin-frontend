const handleSelectInstructor = (selectedInstructor, instructorOptions, form) => {
    const chosenInstructor = instructorOptions.instructorNamesandIDs.filter(instructorOption => instructorOption.name === selectedInstructor)[0]

    form.setFieldsValue({ instructor: chosenInstructor.name, instructorID: chosenInstructor.id })
}

export default handleSelectInstructor