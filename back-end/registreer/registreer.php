<?php
require_once '../config/db.php';
require_once 'user.php';

$naam = $_POST['naam'];
$email = $_POST['email'];
$wachtwoord = $_POST['wachtwoord'];

$user = new User(null, $naam, $email, $wachtwoord);
$conn = getDbConnection();

// Roep the createUser method aan om de gebruiker te registreren
$userId = $user->createUser($conn);

if ($userId) {
    // Registratie succesvol, redirect naar de homepagina
    header("Location: ../../front-end/pages/login-form.html");
    exit;
} else {
    // Registratie mislukt, geef een foutmelding weer
    echo "Registratie mislukt. Probeer het opnieuw.";
}

?>