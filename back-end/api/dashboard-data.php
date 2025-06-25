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
    
    // Get ALL sensor data with relationships
    $stmt = $db->query("SELECT s.tijdstip, 
                      a.waterverbruik_auto, a.waterstofopslag_auto,
                      o.buitentemperatuur, o.binnentemperatuur, o.luchtdruk, 
                      o.luchtvochtigheid, o.co2_concentratie_binnen, o.accu_level, o.waterstofproductie,
                      w.zonnepaneelspanning, w.zonnepaneelstroom, w.stroomverbruik_woning, w.waterstofopslag_woning  
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
    $solarCurrent = [];
    $solarPower = [];
    $hydrogenProduction = [];
    $carHydrogenUsage = [];
    $tempOutside = [];
    $tempInside = [];
    $pressure = [];
    $humidity = [];
    $co2Level = [];
    $batteryLevel = [];
    $homePower = [];
    $homeHydrogen = [];
    $carHydrogen = [];
    
    foreach ($data as $row) {
        // Format timestamp based on data quantity
        $timestamp = strtotime($row['tijdstip']);
        $labels[] = date('d/m H:i', $timestamp);
        
        // Solar panel data
        $voltage = (float)$row['zonnepaneelspanning'];
        $current = (float)$row['zonnepaneelstroom'];
        $solarVoltage[] = $voltage;
        $solarCurrent[] = $current;
        $solarPower[] = round($voltage * $current, 2);
        
        // Home energy data
        $homePower[] = (float)$row['stroomverbruik_woning'];
        $homeHydrogen[] = (float)$row['waterstofopslag_woning'];
        
        // Car data
        $carHydrogenUsage[] = (float)$row['waterverbruik_auto'];
        $carHydrogen[] = (float)$row['waterstofopslag_auto'];
        
        // Environment data
        $hydrogenProduction[] = (float)$row['waterstofproductie'];
        $tempOutside[] = (float)$row['buitentemperatuur'];
        $tempInside[] = (float)$row['binnentemperatuur'];
        $pressure[] = (float)$row['luchtdruk'];
        $humidity[] = (float)$row['luchtvochtigheid'];
        $co2Level[] = (float)$row['co2_concentratie_binnen'];
        $batteryLevel[] = (float)$row['accu_level'];
    }
    
    echo json_encode([
        'status' => 'success',
        'data' => [
            'labels' => $labels,
            'solar' => [
                'voltage' => $solarVoltage,
                'current' => $solarCurrent,
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
                'hydrogen' => $carHydrogen,
                'usage' => $carHydrogenUsage
            ],
            'home' => [
                'power' => $homePower,
                'hydrogen' => $homeHydrogen
            ],
            'environment' => [
                'pressure' => $pressure,
                'humidity' => $humidity,
                'co2' => $co2Level,
                'battery' => $batteryLevel
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