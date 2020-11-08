const handleSelectStudent = (selectedStudent, studentOptions, form) => {
    const chosenStudent = studentOptions.studentNamesandIDs.filter(studentOption => studentOption.name === selectedStudent)[0]

    form.setFieldsValue({ student: chosenStudent.name, studentID: chosenStudent.id })
}

export default handleSelectStudent