<?php
include './../config/db.php';
include 'session.php';

header('Content-Type: application/json');

// Controleer of het een POST-verzoek is
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);            // Haal het e-mailadres op
    $wachtwoord = $_POST['wachtwoord'];       // Haal het wachtwoord op

    // Controleer of email en wachtwoord zijn ingevuld
    if (empty($email) || empty($wachtwoord)) {
        echo json_encode(['success' => false, 'message' => 'Email en wachtwoord zijn verplicht.']);
        exit();
    }

    $conn = getDbConnection();

    $query = "SELECT * FROM user WHERE email = :email";
    $stmt = $conn->prepare($query);

    try {
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Controleer of gebruiker bestaat
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Geen gebruiker gevonden met dit emailadres.']);
            exit();
        }

        // Controleer of het wachtwoord klopt
//        if (!password_verify($wachtwoord, $user["wachtwoord"])) {
//            echo json_encode(['success' => false, 'message' => 'Onjuist wachtwoord.']);
//            exit();
//        }

        // Sla gebruikersgegevens op in de sessie
        logSession($user["naam"], $user["email"]);

        // Stuur succesbericht terug
        echo json_encode([
            'success' => true,
            'role' => 'user',
            'naam' => $user["naam"],
            'redirect' => '../../front-end/pages/dashboard.html'
        ]);
        exit();

    } catch (PDOException $e) {
        // Fout bij databaseverzoek
        echo json_encode(['success' => false, 'message' => 'Serverfout.']);
        exit();
    }
}
?>