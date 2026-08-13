<?php
session_start();
include("../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idCliente'])) {
    echo json_encode(["success" => false, "mensaje" => "No hay una sesión de cliente activa"]);
    exit;
}

$idCliente = $_SESSION['idCliente'];

$query = "SELECT t.idTicket, t.idPoliza, t.conceptoT, t.statusT, t.modalidadAtencionT, 
                 t.fechaCreacionT, p.nombreEmpresaP, pl.nombreP 
          FROM ticket t 
          INNER JOIN poliza p ON t.idPoliza = p.idPoliza 
          INNER JOIN plan pl ON p.idPlan = pl.idPlan 
          WHERE p.idCliente = ? 
          ORDER BY t.idTicket DESC";

$stmt = $mysqli->prepare($query);

if (!$stmt) {
    echo json_encode(["success" => false, "mensaje" => "Error preparando la consulta: " . $mysqli->error]);
    exit;
}

$stmt->bind_param("i", $idCliente);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "mensaje" => "Error ejecutando la consulta: " . $stmt->error]);
    exit;
}

$resultado = $stmt->get_result();
$tickets = [];

while ($row = $resultado->fetch_assoc()) {
    $tickets[] = $row;
}

echo json_encode(["success" => true, "tickets" => $tickets]);

$stmt->close();
$mysqli->close();
?>