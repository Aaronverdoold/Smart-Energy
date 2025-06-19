<?php
session_start();
require_once '../config/db.php';
require_once 'user.php';

// Get the posted form data
$naam = $_POST['naam'];
$email = $_POST['email'];

// Get user_id from session (assuming it's stored there)
$user_id = $_SESSION['user_id'] ?? 1; // Default to 1 if not set

// Get the current password from database
$conn = getDbConnection();
$stmt = $conn->prepare("SELECT wachtwoord FROM user WHERE user_id = ?");
$stmt->execute([$user_id]);
$user_data = $stmt->fetch(PDO::FETCH_ASSOC);
$wachtwoord = $user_data['wachtwoord'];

// Create User object
$user = new User($user_id, $naam, $email, $wachtwoord);

// Update the user
if ($user->updateUser($conn)) {
    // Update successful
    header("Location: ../../front-end/pages/profile.html?success=1");
} else {
    // Update failed
    header("Location: ../../front-end/pages/profile.html?error=1");
}
?>