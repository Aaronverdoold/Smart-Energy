document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    
    if (form) {
        // Add error container to the form
        const errorContainer = document.createElement('div');
        errorContainer.id = 'login-error';
        errorContainer.style.color = '#ef4444';
        errorContainer.style.marginBottom = '16px';
        errorContainer.style.display = 'none';
        
        // Insert error container after the form title
        const formTitle = document.querySelector('.form-title');
        formTitle.insertAdjacentElement('afterend', errorContainer);
        
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            
            // Clear previous errors
            errorContainer.style.display = 'none';
            errorContainer.textContent = '';

            const formData = new FormData(form);
            
            // Use the debug version for troubleshooting
            fetch('../../back-end/login/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.redirect || '../../front-end/pages/dashboard.html';
                } else {
                    errorContainer.textContent = data.message || 'Login failed';
                    errorContainer.style.display = 'block';
                }
            })
            .catch(error => {
                errorContainer.textContent = 'An error occurred while trying to log in';
                errorContainer.style.display = 'block';
                console.error('Login error:', error);
            });
        });
    }
});