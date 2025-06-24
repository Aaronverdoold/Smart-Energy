<?php
// Database data provider for dashboard
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Access-Control-Allow-Origin: *');

// Use your existing database connection
require_once '../config/db.php';

try {
    $db = getDbConnection();
    
    // Modified to fetch ALL records by removing LIMIT clause
    $stmt = $db->query("SELECT s.tijdstip, a.waterstofopslag_auto, o.buitentemperatuur, 
                      o.binnentemperatuur, o.waterstofproductie, w.zonnepaneelspanning, 
                      w.zonnepaneelstroom  
                      FROM sensordata s
                      JOIN autoenergiedata a ON s.sensor_data_id = a.sensor_data_id
                      JOIN omgevingsenergiedata o ON s.sensor_data_id = o.sensor_data_id
                      JOIN woningenergiedata w ON s.sensor_data_id = w.sensor_data_id
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
        // Format timestamp to be more readable (day + time)
        $timestamp = strtotime($row['tijdstip']);
        $labels[] = date('d/m H:i', $timestamp);
        
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