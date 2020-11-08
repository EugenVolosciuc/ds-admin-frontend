const handleSelectVehicle = (selectedVehicle, vehicleOptions, form) => {
    const chosenVehicle = vehicleOptions.vehicleNamesandIDs.filter(vehicleOption => vehicleOption.name === selectedVehicle)[0]

    form.setFieldsValue({ vehicle: chosenVehicle.name, vehicleID: chosenVehicle.id })
}

export default handleSelectVehicle