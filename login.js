document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const forgotPasswordLink = document.querySelector('.forgot-password');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const cancelResetBtn = document.getElementById('cancel-reset');

    // Check if there's a saved email
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.innerHTML = type === 'password' ? 
            '<i class="fas fa-eye"></i>' : 
            '<i class="fas fa-eye-slash"></i>';
    });

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);

            if (!user) {
                alert('Email not found. Please sign up first.');
                return;
            }

            // Check password
            if (btoa(password) !== user.password) {
                alert('Invalid password.');
                return;
            }

            // Handle remember me
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // Set login state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', user.name);

            // Redirect to main page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    });

    // Handle forgot password
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.classList.add('active');
        const resetEmailInput = document.getElementById('reset-email');
        resetEmailInput.value = emailInput.value; // Pre-fill email if available
    });

    // Handle reset password form
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const resetEmail = document.getElementById('reset-email').value.trim();

        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === resetEmail);

            if (!user) {
                alert('Email not found. Please sign up first.');
                return;
            }

            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-8);
            user.password = btoa(tempPassword);

            // Update user in localStorage
            const userIndex = users.findIndex(u => u.email === resetEmail);
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));

            // Show success message with temporary password
            alert(`Password reset successful! Your temporary password is: ${tempPassword}\nPlease change it after logging in.`);
            
            forgotPasswordModal.classList.remove('active');
        } catch (error) {
            console.error('Password reset error:', error);
            alert('Password reset failed. Please try again.');
        }
    });

    // Handle cancel reset
    cancelResetBtn.addEventListener('click', () => {
        forgotPasswordModal.classList.remove('active');
    });

    // Close modal when clicking outside
    forgotPasswordModal.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.classList.remove('active');
        }
    });

    // Handle signup link
    document.getElementById('signup-link').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Sign up functionality coming soon!');
    });
});

// Handle Google Sign-in
function handleGoogleLogin(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    
    try {
        // Check if user exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === responsePayload.email);

        if (!user) {
            alert('No account found. Please sign up first.');
            window.location.href = 'signup.html';
            return;
        }

        // Set login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', responsePayload.email);
        localStorage.setItem('userName', responsePayload.name);
        localStorage.setItem('userPicture', responsePayload.picture);

        // Redirect to main page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Google login error:', error);
        alert('Google login failed. Please try again.');
    }
}

// Decode JWT token from Google
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
} 