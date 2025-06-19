<?php
class User {
    private $user_id;
    public $name;
    public $email;
    private $wachtwoord;

    public function __construct($user_id, $name, $email, $wachtwoord) {
        $this->user_id = $user_id;
        $this->name = $name;
        $this->email = $email;
        $this->wachtwoord = $wachtwoord;
    }

    // Een functie om de user te registreren in de database
    public function createUser($conn) {
        try {
            $sql = "INSERT INTO user (naam, email, wachtwoord) 
                VALUES (:naam, :email, :wachtwoord)";

            // Maakt een prepared statement
            $stmt = $conn->prepare($sql);

            // Hash het wachtwoord
            $hashedPassword = password_hash($this->wachtwoord, PASSWORD_DEFAULT);

            // Koppel de parameters aan de statement
            $stmt->bindParam(':naam', $this->name, PDO::PARAM_STR);
            $stmt->bindParam(':email', $this->email, PDO::PARAM_STR);
            $stmt->bindParam(':wachtwoord', $hashedPassword, PDO::PARAM_STR);

            if ($stmt->execute()) {
                return $conn->lastInsertId();
            } else {
                throw new Exception("Failed to create user.");
            }
        } catch (Exception $e) {
            die("Error: " . $e->getMessage());
        }
    }

    public function updateUser($conn) {
        try {
            $sql = "UPDATE user SET naam = :naam, email = :email, wachtwoord = :wachtwoord 
                    WHERE user_id = :user_id";

            $stmt = $conn->prepare($sql);

            $hashedPassword = password_hash($this->wachtwoord, PASSWORD_DEFAULT);

            $stmt->bindParam(':naam', $this->name, PDO::PARAM_STR);
            $stmt->bindParam(':email', $this->email, PDO::PARAM_STR);
            $stmt->bindParam(':wachtwoord', $hashedPassword, PDO::PARAM_STR);
            $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return true;
            } else {
                throw new Exception("Failed to update user.");
            }
        } catch (Exception $e) {
            die("Error: " . $e->getMessage());
        }      
    }

}
