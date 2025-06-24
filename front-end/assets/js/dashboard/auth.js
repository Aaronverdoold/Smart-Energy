class DashboardAuth {
    constructor(userNameId, logoutBtnId) {
        this.userNameElem = document.getElementById(userNameId);
        this.logoutBtn = document.getElementById(logoutBtnId);
        this.init();
    }

    async init() {
        await this.showUserName();
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async showUserName() {
        try {
            const res = await fetch('../../back-end/login/checkSession.php');
            const data = await res.json();
            if (data.loggedIn && data.naam) {
                this.userNameElem.textContent = data.naam;
            } else {
                window.location.href = 'login-form.html';
            }
        } catch {
            this.userNameElem.textContent = 'Unknown';
        }
    }

    async logout() {
        await fetch('../../back-end/login/logout.php');
        window.location.href = 'login-form.html';
    }
}

document.getElementById('profile-btn').addEventListener('click', function() {
    window.location.href = '../pages/profile.html';
});

document.addEventListener('DOMContentLoaded', () => {
    new DashboardAuth('user-name', 'logout-btn');
});