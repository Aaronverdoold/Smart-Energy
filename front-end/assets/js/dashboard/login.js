document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(form);

            fetch('../../back-end/login/login.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '../../front-end/pages/dashboard.html';
                    } else {
                        alert(data.message || 'Login failed');
                    }
                })
                .catch(error => {
                    alert('An error occurred');
                    console.error(error);
                });
        });
    }
});