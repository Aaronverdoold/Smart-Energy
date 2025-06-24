document.getElementById('logout-btn').addEventListener('click', async function() {
    await fetch('../../back-end/login/logout.php');
    window.location.href = '../pages/login-form.html';
});