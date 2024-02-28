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


// Function to handle form submission for login
document.querySelector("form.login").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the email and password from the login form
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        // Send a POST request to the server with the login credentials
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        // Parse the JSON response
        const data = await response.json();

        // Check if the response is successful
        if (response.ok) {
            // Store the token in localStorage
            localStorage.setItem('token', data.token);
            // Redirect to the appropriate page based on the response
            window.location.href = data.redirectUrl; // Assuming the server sends a redirect URL
        } else {
            // Display an error message if login failed
            alert(data.error || "Login failed");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred. Please try again later.");
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