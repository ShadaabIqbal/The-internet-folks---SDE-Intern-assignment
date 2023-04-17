/*----------Validation for no data passed-----------*/
const requiredInput = function (value) {
    return Object.keys(value).length > 0
};

/*----------Validation to check field value is empty-----------*/
const isEmpty = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

/*----------Validation for name-----------*/
const isValidName = function (name) {
    const nameRegex = /^[a-zA-Z ]+$/;
    return nameRegex.test(name);
};

/*----------Validation for email-----------*/
const isValidEmail = function (email) {
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z-]+\.([a-zA-Z-.]{2,4})+$/
    return emailRegex.test(email);
};

/*----------Validation for password-----------*/
const isValidPswd = (Password) => {
    return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(Password)
};


/*----------Validation for member name-----------*/
const isValidMember = function (title) {
    const regex = /^(Community Admin|Community Member)+$\b/
    return regex.test(title)
}

module.exports = { isEmpty, isValidName, isValidEmail, isValidPswd, requiredInput, isValidMember };