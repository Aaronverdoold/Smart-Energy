<?php
// Database data provider for dashboard
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Access-Control-Allow-Origin: *');

// Use your existing database connection
require_once '../config/db.php';

try {
    $db = getDbConnection();
    
    // Handle date filtering
    $dateFilter = "";
    if (isset($_GET['start']) && isset($_GET['end'])) {
        $start = $_GET['start'];
        $end = $_GET['end'];
        // Add 23:59:59 to end date to include the entire day
        $dateFilter = "WHERE s.tijdstip BETWEEN '$start 00:00:00' AND '$end 23:59:59'";
    }
    
    // Get sensor data with relationships
    $stmt = $db->query("SELECT s.tijdstip, a.waterstofopslag_auto, o.buitentemperatuur, 
                      o.binnentemperatuur, o.waterstofproductie, w.zonnepaneelspanning, 
                      w.zonnepaneelstroom  
                      FROM sensordata s
                      JOIN autoenergiedata a ON s.sensor_data_id = a.sensor_data_id
                      JOIN omgevingsenergiedata o ON s.sensor_data_id = o.sensor_data_id
                      JOIN woningenergiedata w ON s.sensor_data_id = w.sensor_data_id
                      $dateFilter
                      ORDER BY s.tijdstip ASC");
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format data for charts
    $labels = [];
    $solarVoltage = [];
    $solarPower = [];
    $hydrogenProduction = [];
    $tempOutside = [];
    $tempInside = [];
    $carHydrogen = [];
    
    foreach ($data as $row) {
        // Format timestamp based on date range length
        $timestamp = strtotime($row['tijdstip']);
        
        // Choose format based on data quantity
        if (count($data) > 100) {
            $labels[] = date('d/m', $timestamp); // Just day/month for large datasets
        } else {
            $labels[] = date('d/m H:i', $timestamp); // Day/month and time for smaller datasets
        }
        
        // Solar panel data
        $voltage = (float)$row['zonnepaneelspanning'];
        $current = (float)$row['zonnepaneelstroom'];
        $solarVoltage[] = $voltage;
        $solarPower[] = round($voltage * $current, 2);
        
        // Hydrogen & temperature data
        $hydrogenProduction[] = (float)$row['waterstofproductie'];
        $tempOutside[] = (float)$row['buitentemperatuur'];
        $tempInside[] = (float)$row['binnentemperatuur'];
        
        // Car hydrogen level
        $carHydrogen[] = (float)$row['waterstofopslag_auto'];
    }
    
    echo json_encode([
        'status' => 'success',
        'data' => [
            'labels' => $labels,
            'solar' => [
                'voltage' => $solarVoltage,
                'power' => $solarPower
            ],
            'hydrogen' => [
                'production' => $hydrogenProduction
            ],
            'temperature' => [
                'outside' => $tempOutside,
                'inside' => $tempInside
            ],
            'car' => [
                'hydrogen' => $carHydrogen
            ]
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>