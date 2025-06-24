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
            // SQL-query om de gebruikersgegevens bij te werken op basis van user_id
            $sql = "UPDATE user SET naam = :naam, email = :email, wachtwoord = :wachtwoord 
                WHERE user_id = :user_id";

            // Bereidt de SQL-query voor
            $stmt = $conn->prepare($sql);

            // Hash het nieuwe wachtwoord voor veilige opslag
            $hashedPassword = password_hash($this->wachtwoord, PASSWORD_DEFAULT);

            // Bindt de waarden aan de query-parameters
            $stmt->bindParam(':naam', $this->name, PDO::PARAM_STR);
            $stmt->bindParam(':email', $this->email, PDO::PARAM_STR);
            $stmt->bindParam(':wachtwoord', $hashedPassword, PDO::PARAM_STR);
            $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);

            // Voert de query uit en retourneert true als het succesvol was
            if ($stmt->execute()) {
                return true;
            } else {
                // Gooi een uitzondering als het bijwerken mislukt
                throw new Exception("Failed to update user.");
            }
        } catch (Exception $e) {
            // Vang fouten op en toon de foutmelding
            die("Error: " . $e->getMessage());
        }
    }
}
