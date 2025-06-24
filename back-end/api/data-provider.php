<?php
// Debug mode - set to true to see detailed errors
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include database connection
require_once '../config/db.php';

// Get database connection
$conn = getDbConnection();

// Set headers to prevent caching
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

try {
    // Check for date range parameters
    $dateFilter = "";
    if (isset($_GET['start']) && isset($_GET['end'])) {
        $start = $_GET['start'];
        $end = $_GET['end'];
        $dateFilter = "WHERE s.tijdstip BETWEEN '$start 00:00:00' AND '$end 23:59:59'";
    }
    
    // Get all data
    $data = [
        'solar' => getSolarData($conn, $dateFilter),
        'hydrogen' => getHydrogenData($conn, $dateFilter),
        'temperature' => getTemperatureData($conn, $dateFilter),
        'car' => getCarData($conn, $dateFilter)
    ];
    
    // Verify we have data
    if (empty($data['solar']['labels'])) {
        throw new Exception("No data returned from database");
    }
    
    // Return data as JSON
    echo json_encode($data);
}
catch (Exception $e) {
    // Return error as JSON
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
    exit;
}

/**
 * Get solar panel data
 */
function getSolarData($conn, $dateFilter = "") {
    // Get solar panel data with voltage and current
    $sql = "SELECT s.tijdstip, w.zonnepaneelspanning, w.zonnepaneelstroom 
            FROM sensordata s
            JOIN woningenergiedata w ON s.sensor_data_id = w.sensor_data_id 
            $dateFilter
            ORDER BY s.tijdstip ASC 
            LIMIT 96";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $labels = [];
    $voltage = [];
    $power = [];
    
    foreach ($rows as $row) {
        $labels[] = date('H:i', strtotime($row['tijdstip']));
        $volt = (float)$row['zonnepaneelspanning'];
        $current = (float)$row['zonnepaneelstroom'];
        
        $voltage[] = $volt;
        $power[] = round($volt * $current, 2); // Calculate power as V * I
    }
    
    return [
        'labels' => $labels,
        'voltage' => $voltage,
        'power' => $power
    ];
}

/**
 * Get hydrogen storage data
 */
function getHydrogenData($conn, $dateFilter = "") {
    $sql = "SELECT s.tijdstip, w.waterstofopslag_woning 
            FROM sensordata s
            JOIN woningenergiedata w ON s.sensor_data_id = w.sensor_data_id 
            $dateFilter
            ORDER BY s.tijdstip ASC 
            LIMIT 96";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $labels = [];
    $storage = [];
    
    foreach ($rows as $row) {
        $labels[] = date('H:i', strtotime($row['tijdstip']));
        $storage[] = (float)$row['waterstofopslag_woning'];
    }
    
    return [
        'labels' => $labels,
        'storage' => $storage
    ];
}

/**
 * Get temperature and humidity data
 */
function getTemperatureData($conn, $dateFilter = "") {
    $sql = "SELECT s.tijdstip, o.buitentemperatuur, o.luchtvochtigheid 
            FROM sensordata s
            JOIN omgevingsenergiedata o ON s.sensor_data_id = o.sensor_data_id 
            $dateFilter
            ORDER BY s.tijdstip ASC 
            LIMIT 96";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $labels = [];
    $temp = [];
    $humidity = [];
    
    foreach ($rows as $row) {
        $labels[] = date('H:i', strtotime($row['tijdstip']));
        $temp[] = (float)$row['buitentemperatuur'];
        $humidity[] = (float)$row['luchtvochtigheid'];
    }
    
    return [
        'labels' => $labels,
        'temp' => $temp,
        'humidity' => $humidity
    ];
}

/**
 * Get car hydrogen storage data
 */
function getCarData($conn, $dateFilter = "") {
    $sql = "SELECT s.tijdstip, a.waterstofopslag_auto 
            FROM sensordata s
            JOIN autoenergiedata a ON s.sensor_data_id = a.sensor_data_id 
            $dateFilter
            ORDER BY s.tijdstip ASC 
            LIMIT 96";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $labels = [];
    $battery = [];
    
    foreach ($rows as $row) {
        $labels[] = date('H:i', strtotime($row['tijdstip']));
        $battery[] = (float)$row['waterstofopslag_auto'];
    }
    
    return [
        'labels' => $labels,
        'battery' => $battery
    ];
}
?>