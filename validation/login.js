module.exports = function validateLoginInput(data) {
	let errors = {};
	if (!data.username) {
		errors.username = "Username field is required";
	} else if (!data.password) {
		errors.username = "Password field is required";
	}

    return {
        errors,
        isValid:Object.keys(errors).length > 0 ? false:true,
    }
};
