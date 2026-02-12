document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const toggleAuthBtn = document.getElementById('toggle-auth');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');
    const submitBtn = document.getElementById('submit-btn');
    const usernameField = document.getElementById('username-field');
    const toggleText = document.getElementById('toggle-text');
    const forgotPasswordContainer = document.getElementById('forgot-password-container');
    const alertBox = document.getElementById('alert-box');

    let isRegistering = false;

    // Check URL params for mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'register') {
        toggleMode();
    }

    toggleAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMode();
    });

    function toggleMode() {
        isRegistering = !isRegistering;
        
        if (isRegistering) {
            formTitle.textContent = "Create Account";
            formSubtitle.textContent = "Start monitoring your logs with AI precision";
            submitBtn.textContent = "Sign Up";
            usernameField.classList.remove('hidden');
            document.getElementById('username').required = true;
            toggleText.textContent = "Already have an account?";
            toggleAuthBtn.textContent = "Sign In";
            forgotPasswordContainer.classList.add('hidden');
        } else {
            formTitle.textContent = "Welcome Back";
            formSubtitle.textContent = "Enter your credentials to access the dashboard";
            submitBtn.textContent = "Sign In";
            usernameField.classList.add('hidden');
            document.getElementById('username').required = false;
            toggleText.textContent = "Don't have an account?";
            toggleAuthBtn.textContent = "Create Account";
            forgotPasswordContainer.classList.remove('hidden');
        }
    }

    function showAlert(message, type = 'error') {
        alertBox.textContent = message;
        alertBox.classList.remove('hidden');
        if (type === 'error') {
            alertBox.classList.add('bg-red-500/20', 'text-red-200', 'border', 'border-red-500/30');
            alertBox.classList.remove('bg-green-500/20', 'text-green-200', 'border-green-500/30');
        } else {
            alertBox.classList.add('bg-green-500/20', 'text-green-200', 'border', 'border-green-500/30');
            alertBox.classList.remove('bg-red-500/20', 'text-red-200', 'border-red-500/30');
        }
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
        alertBox.classList.add('hidden');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;

        const endpoint = isRegistering ? '/api/v1/users/register' : '/api/v1/users/login';
        const body = { email, password };
        if (isRegistering) body.username = username;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                if (isRegistering) {
                    showAlert('Account created successfully! Redirecting to login...', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html'; // Or auto login
                    }, 1500);
                } else {
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    // Fetch user details to store name if needed, or just redirect
                    window.location.href = 'dashboard.html';
                }
            } else {
                // Determine error message
                let msg = data.message || "An error occurred";
                // If it's an HTML response (string), generic error
                if (typeof data === 'string') msg = "Server Error";
                showAlert(msg, 'error');
            }
        } catch (error) {
            console.error('Auth Error:', error);
            showAlert('Failed to connect to the server. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = isRegistering ? "Sign Up" : "Sign In";
        }
    });
});
