<?php
class SessionManager {
    /**
     * Start de sessie als deze nog niet is gestart.
     */
    public static function start() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /**
     * Log de gebruiker in door sessievariabelen te zetten.
     */
    public static function login($naam, $email) {
        self::start();
        $_SESSION['loggedin'] = true;
        $_SESSION['naam'] = $naam;
        $_SESSION['email'] = $email;
    }

    /**
     * Log de gebruiker uit en vernietig de sessie.
     */
    public static function logout() {
        self::start();
        session_unset();
        session_destroy();
    }

    /**
     * Controleer of de gebruiker is ingelogd.
     */
    public static function isLoggedIn() {
        self::start();
        return isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true;
    }

    /**
     * Haal de huidige gebruikersnaam op.
     */
    public static function getCurrentUsername() {
        self::start();
        return isset($_SESSION['naam']) ? $_SESSION['naam'] : null;
    }

    /**
     * Controleer of de sessie is verlopen na 10 min en log de gebruiker uit bij timeout.
     */
    public static function checkTimeout($timeout = 600) {
        self::start();
        if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > $timeout)) {
            self::logout();
            header('Location: ../../front-end/pages/login.html');
            exit();
        }
        $_SESSION['LAST_ACTIVITY'] = time();
    }
}
?>