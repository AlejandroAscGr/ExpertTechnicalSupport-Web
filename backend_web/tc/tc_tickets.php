<?php
session_start();
include("../../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idEmpleado']) || $_SESSION['perfil'] !== 'TECNICO') {
    echo json_encode(["success" => false, "mensaje" => "Acceso denegado"]);
    exit;
}

$idEmpleado = $_SESSION['idEmpleado'];
$query = "SELECT t.idTicket, t.conceptoT, t.statusT, t.modalidadAtencionT, t.fechaCreacionT, p.nombreEmpresaP
          FROM ticket t
          JOIN poliza p ON t.idPoliza = p.idPoliza
          WHERE t.idEmpleado = ?
          ORDER BY t.fechaCreacionT DESC";

$stmt = $mysqli->prepare($query);
$stmt->bind_param("i", $idEmpleado);
$stmt->execute();
$resultado = $stmt->get_result();

$tickets = [];
while($row = $resultado->fetch_assoc()){
    $tickets[] = $row;
}

echo json_encode([
    "success" => true, 
    "tecnico" => $_SESSION['usuario'], 
    "tickets" => $tickets
]);

$stmt->close();
$mysqli->close();
?>