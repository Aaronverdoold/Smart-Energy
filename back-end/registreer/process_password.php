<?php
session_start();
require_once '../config/db.php';
require_once 'user.php';

// Get the current user info
$user_id = $_SESSION['user_id'] ?? 1; // Default to 1 if not set
$conn = getDbConnection();
$stmt = $conn->prepare("SELECT naam, email FROM user WHERE user_id = ?");
$stmt->execute([$user_id]);
$user_data = $stmt->fetch(PDO::FETCH_ASSOC);

// Get the posted form data
$new_password = $_POST['wachtwoord'];

// Create User object with the new password
$user = new User($user_id, $user_data['naam'], $user_data['email'], $new_password);

// Update the user (this will hash the password)
if ($user->updateUser($conn)) {
    // Update successful
    header("Location: ../../front-end/pages/profile.html?password_success=1");
} else {
    // Update failed
    header("Location: ../../front-end/pages/profile.html?password_error=1");
}
?>