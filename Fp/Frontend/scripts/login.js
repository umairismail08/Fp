document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = ''; // Clear previous errors

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost/fp/admin/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                if (data.role === 'admin') {
                    // Admin logged in, redirect to the admin panel
                    window.location.href = data.redirect;
                } else {
                    // User logged in, save data to localStorage and redirect
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'index.html'; // Redirect to homepage
                }
            } else {
                // Show error message
                errorMessage.textContent = data.message;
            }

        } catch (error) {
            errorMessage.textContent = 'An error occurred. Please try again.';
            console.error('Login Error:', error);
        }
    });
});