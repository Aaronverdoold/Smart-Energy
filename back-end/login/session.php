<?php
require_once 'SessionManager.php';

/** Log een gebruiker in. */
function logSession($naam, $email) {
    SessionManager::login($naam, $email);
}

/** Controleer of een gebruiker is ingelogd. */
function isLoggedIn() {
    return SessionManager::isLoggedIn();
}

/** Haal de huidige gebruikersnaam op. */
function getCurrentUsername() {
    return SessionManager::getCurrentUsername();
}

/** Log de huidige gebruiker uit. */
function logoutSession() {
    SessionManager::logout();
}

/** Controleer of de sessie na 10 min is verlopen en log de gebruiker uit bij timeout. */
function checkSessionTimeout($timeout = 600) {
    SessionManager::checkTimeout($timeout);
}

?>