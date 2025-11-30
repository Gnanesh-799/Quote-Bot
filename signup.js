document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');

    // Toggle password visibility
    function togglePasswordVisibility(input, button) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        button.innerHTML = type === 'password' ? 
            '<i class="fas fa-eye"></i>' : 
            '<i class="fas fa-eye-slash"></i>';
    }

    togglePasswordBtn.addEventListener('click', () => {
        togglePasswordVisibility(passwordInput, togglePasswordBtn);
    });

    toggleConfirmPasswordBtn.addEventListener('click', () => {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordBtn);
    });

    // Handle form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Basic validation
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        try {
            // Here you would typically make an API call to your backend
            // For demo purposes, we'll store in localStorage
            const user = {
                name,
                email,
                password: btoa(password), // Basic encoding (not secure, just for demo)
                signupDate: new Date().toISOString()
            };

            // Check if email already exists
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            if (existingUsers.some(u => u.email === email)) {
                alert('Email already registered!');
                return;
            }

            // Save user
            existingUsers.push(user);
            localStorage.setItem('users', JSON.stringify(existingUsers));

            // Auto login
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);

            // Redirect to main page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Signup error:', error);
            alert('Signup failed. Please try again.');
        }
    });
}); 