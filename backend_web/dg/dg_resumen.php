<?php
session_start();
include("../../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idEmpleado']) || $_SESSION['perfil'] !== 'DIRECTOR') {
    echo json_encode(["success" => false, "mensaje" => "Acceso denegado"]);
    exit;
}

// Métricas base
$resClientes = $mysqli->query("SELECT COUNT(*) as total FROM cliente");
$totClientes = $resClientes->fetch_assoc()['total'];

$resPolizas = $mysqli->query("SELECT COUNT(*) as total FROM poliza");
$totPolizas = $resPolizas->fetch_assoc()['total'];

$resTickets = $mysqli->query("SELECT COUNT(*) as total FROM ticket");
$totTickets = $resTickets->fetch_assoc()['total'];

// Datos para Gráfica 1
$resTS = $mysqli->query("SELECT statusT, COUNT(*) as cantidad FROM ticket GROUP BY statusT");
$ticketsStatus = [];
while($r = $resTS->fetch_assoc()) { $ticketsStatus[] = $r; }

$resPP = $mysqli->query("SELECT pl.nombreP, COUNT(*) as cantidad FROM poliza p JOIN plan pl ON p.idPlan = pl.idPlan GROUP BY pl.nombreP");
$polizasPlan = [];
while($r = $resPP->fetch_assoc()) { $polizasPlan[] = $r; }

echo json_encode([
    "success" => true,
    "usuario" => $_SESSION['usuario'], 
    "clientes" => $totClientes,
    "polizas" => $totPolizas,
    "tickets" => $totTickets,
    "graficas" => [
        "tickets_status" => $ticketsStatus,
        "polizas_plan" => $polizasPlan
    ]
]);

$mysqli->close();
?>