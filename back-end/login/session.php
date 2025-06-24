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
?>