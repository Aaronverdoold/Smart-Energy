<?php
include './../config/db.php';
include 'session.php';

header('Content-Type: application/json');

// Set error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log function to help with debugging
function debug_log($message, $data = null) {
    file_put_contents('login_debug.log', date('Y-m-d H:i:s') . " - $message" . ($data ? ": " . print_r($data, true) : "") . "\n", FILE_APPEND);
}

debug_log("Login attempt started");

// Controleer of het een POST-verzoek is
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email'] ?? '');            // Haal het e-mailadres op
    $wachtwoord = $_POST['wachtwoord'] ?? '';       // Haal het wachtwoord op

    debug_log("Login attempt for email", $email);

    // Controleer of email en wachtwoord zijn ingevuld
    if (empty($email) || empty($wachtwoord)) {
        debug_log("Empty email or password");
        echo json_encode(['success' => false, 'message' => 'Email en wachtwoord zijn verplicht.']);
        exit();
    }

    try {
        $conn = getDbConnection();
        debug_log("Database connection established");

        $query = "SELECT * FROM user WHERE email = :email";
        $stmt = $conn->prepare($query);
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Controleer of gebruiker bestaat
        if (!$user) {
            debug_log("No user found with email", $email);
            echo json_encode(['success' => false, 'message' => 'Geen gebruiker gevonden met dit emailadres.']);
            exit();
        }

        debug_log("User found", $user);
        
        // Log the password comparison details (do NOT do this in production!)
        debug_log("Password provided", $wachtwoord);
        debug_log("Stored password hash", $user["wachtwoord"]);
        
        // Controleer of het wachtwoord klopt
        $password_verify_result = password_verify($wachtwoord, $user["wachtwoord"]);
        debug_log("Password verification result", $password_verify_result ? "true" : "false");
        
        if (!$password_verify_result) {
            debug_log("Password verification failed");
            echo json_encode(['success' => false, 'message' => 'Onjuist wachtwoord.']);
            exit();
        }

        // Sla gebruikersgegevens op in de sessie
        logSession($user["naam"], $user["email"]);
        debug_log("User logged in successfully", $user["naam"]);

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
        debug_log("Database error", $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Serverfout: ' . $e->getMessage()]);
        exit();
    }
}
?>