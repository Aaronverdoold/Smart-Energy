<?php
function getDbConnection() {
    $host = "localhost";
    $db_name = "smartenergy_db";
    $username = "root";
    $password = "";

    try {
        $conn = new PDO(
            "mysql:host=$host;dbname=$db_name",
            $username,
            $password
        );
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}
?>
