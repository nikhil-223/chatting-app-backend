module.exports = function validateRegisterInput(data) {
	let errors = {};
	if (!data.name) {
		errors.name = "Name field is required ";
	} else if (!data.username) {
		errors.username = "Username field is required";
	} else if (!data.password) {
		errors.username = "Password field is required";
	} else if (!data.password2) {
		errors.username = "Confirm Password field is required";
	} else if (data.password.length < 6 && data.password.length > 30) {
		errors.username = "Password must be at least 6 characters";
	} else if (data.password !== data.password2) {
		errors.username = "Passwords must match";
	}

    return {
        errors,
        isValid:Object.keys(errors).length > 0 ? false:true,
    }
};
