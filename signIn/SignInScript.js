const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
// Function to validate email
function isEmailValid(email) {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(email);
}
// Switch to the login form
loginBtn.onclick = () => {
    loginForm.style.marginLeft = "0%";
    loginText.style.marginLeft = "0%";
};
// Switch to the signup form
signupLink.onclick = () => {
    signupBtn.click();
    return false;
};
// Switch to the signup form
signupBtn.onclick = () => {
    loginForm.style.marginLeft = "-50%";
    loginText.style.marginLeft = "-50%";
};

// Validate email for login form
document.querySelector("#login-email").addEventListener("input", (event) => {
    const email = event.target.value;
    const isValid = isEmailValid(email);
    if (!isValid) {
        event.target.setCustomValidity("Please enter a valid email address.");
    } else {
        event.target.setCustomValidity("");
    }
});
// Validate email for signup form
document.querySelector("#signup-email").addEventListener("input", (event) => {
    const email = event.target.value;
    const isValid = isEmailValid(email);
    if (!isValid) {
        event.target.setCustomValidity("Please enter a valid email address.");
    } else {
        event.target.setCustomValidity("");
    }
});

// Function to display error messages
function displayError(inputField, errorMessage) {
    const errorDiv = inputField.nextElementSibling;
    errorDiv.innerText = errorMessage;
    errorDiv.style.display = 'block';
}
// Function to clear error messages
function clearError(inputField) {
    const errorDiv = inputField.nextElementSibling;
    // errorDiv.innerText = '';
    errorDiv.style.display = 'none';
}

// Check if the password and confirm password fields match
function passwordMatch() {
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const confirmPasswordField = document.getElementById('signup-confirm-password');
    const errorMessageDiv = confirmPasswordField.parentElement.querySelector('.error-message');

    if (password !== confirmPassword) {
        errorMessageDiv.innerText = 'Passwords do not match';
        errorMessageDiv.style.display = 'block';
        return false;
    } else {
        errorMessageDiv.innerText = '';
        errorMessageDiv.style.display = 'none';
        return true;
    }
}
// Function to enable or disable the "Signup" button
function toggleSignupButton() {
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    const signupButton = document.getElementById('signup-button');

    if (isEmailValid(emailInput.value) && passwordMatch() && passwordInput.value && confirmPasswordInput.value) {
        signupButton.removeAttribute('disabled');
    } else {
        signupButton.setAttribute('disabled', 'disabled');
    }
}

// Event listeners for input fields
document.querySelector("#login-email").addEventListener("input", (event) => {
    const email = event.target.value;
    if (!email) {
        displayError(event.target, 'Email is required');
    } else if (!isEmailValid(email)) {
        displayError(event.target, 'Please enter a valid email address');
    } else {
        clearError(event.target);
    }
    toggleSignupButton();
});

document.querySelector("#signup-email").addEventListener("input", (event) => {
    const email = event.target.value;
    if (!email) {
        displayError(event.target, 'Email is required');
    } else if (!isEmailValid(email)) {
        displayError(event.target, 'Please enter a valid email address');
    } else {
        clearError(event.target);
    }
    toggleSignupButton();
});

document.querySelector("#signup-password").addEventListener("input", () => {
    toggleSignupButton();
});

document.querySelector("#signup-confirm-password").addEventListener("input", () => {
    toggleSignupButton();
});

// Event listener for the "Signup" button
document.getElementById('signup-form').addEventListener('submit', (event) => {
    event.preventDefault()
    if (!passwordMatch()) return alert('Password have to match!')

    const form = event.target
    const formData = new FormData(form)
    for (const value of formData.values()) {
        console.log(value);
    }
    let jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });
    console.log(jsonData)
// Send JSON data to the backend
    fetch(form.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Handle response from the backend
            console.log(data);
        })
        .catch(error => {
            // Handle errors
            console.error('There was a problem with the fetch operation:', error);
        });
});