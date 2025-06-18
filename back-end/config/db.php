<?php
$servername = "localhost";
$username = "root"; 
$password = "";
$dbname = "smartenergy_db";

//connection
$conn = new mysqli($servername, $username, $password, $dbname);
// check
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
} 
echo "Connected successfully";
?>