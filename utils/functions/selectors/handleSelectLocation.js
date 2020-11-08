const handleSelectLocation = (selectedLocation, locationOptions , form) => {
    const chosenLocation = locationOptions.locationNamesandIDs.filter(locationOption => locationOption.name === selectedLocation)[0]

    form.setFieldsValue({ location: chosenLocation.name, locationID: chosenLocation.id })
}

export default handleSelectLocation