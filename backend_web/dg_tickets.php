<?php
session_start();
include("../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idEmpleado']) || $_SESSION['perfil'] !== 'DIRECTOR') {
    echo json_encode(["success" => false, "mensaje" => "Acceso denegado"]);
    exit;
}

// Extraemos los tickets, vinculando la póliza (para el nombre de empresa) y al técnico si existe.
$query = "SELECT t.idTicket, t.conceptoT, t.statusT, t.fechaCreacionT,
                 p.nombreEmpresaP, e.nombresEmp
          FROM ticket t
          JOIN poliza p ON t.idPoliza = p.idPoliza
          LEFT JOIN empleado e ON t.idEmpleado = e.idEmpleado
          ORDER BY t.idTicket DESC";
$resultado = $mysqli->query($query);

$tickets = [];
while($row = $resultado->fetch_assoc()){
    $tickets[] = $row;
}

echo json_encode(["success" => true, "tickets" => $tickets]);
$mysqli->close();
?>