<?php
include 'session.php';

header('Content-Type: application/json');

logoutSession();

echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
exit();
?>