<?php
session_start();
include("../../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idEmpleado']) || $_SESSION['perfil'] !== 'DIRECTOR') {
    echo json_encode(["success" => false, "mensaje" => "Acceso denegado"]);
    exit;
}

$query = "SELECT 
            t.idTicket, t.conceptoT, t.statusT as ticket_status, t.fechaCreacionT,
            p.nombreEmpresaP, p.estadoP as poliza_status,
            pl.nombreP as plan,
            c.nombreC, c.apellidoC,
            e.nombresEmp, e.apellidosEmp
          FROM ticket t
          JOIN poliza p ON t.idPoliza = p.idPoliza
          JOIN plan pl ON p.idPlan = pl.idPlan
          JOIN cliente c ON p.idCliente = c.idCliente
          LEFT JOIN empleado e ON t.idEmpleado = e.idEmpleado
          ORDER BY t.fechaCreacionT DESC";

$resultado = $mysqli->query($query);
$reporte = [];
while($row = $resultado->fetch_assoc()){
    $reporte[] = $row;
}

echo json_encode(["success" => true, "data" => $reporte]);
$mysqli->close();
?>