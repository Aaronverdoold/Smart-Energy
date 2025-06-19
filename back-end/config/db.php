<?php
// Functie om een PDO database connectie op te zetten
function getDbConnection() {
    $host = "localhost";
    $db_name = "smartenergy_db";
    $username = "root";
    $password = "";

    // Maak een nieuwe PDO connectie aan
    try {
        $conn = new PDO(
            "mysql:host=$host;dbname=$db_name",
            $username,
            $password
        );
        // Zet foutafhandeling op Exception modus
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        // Stop script en toon foutmelding bij mislukte connectie
        die("Connection failed: " . $e->getMessage());
    }
}
?>