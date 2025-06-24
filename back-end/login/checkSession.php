<?php
require_once 'session.php';
header('Content-Type: application/json');

if (isLoggedIn()) {
    echo json_encode([
        'loggedIn' => true,
        'naam' => getCurrentUsername()
    ]);
} else {
    echo json_encode([
        'loggedIn' => false
    ]);
}
?>