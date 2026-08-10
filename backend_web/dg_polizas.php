<?php
session_start();
include("../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idEmpleado']) || $_SESSION['perfil'] !== 'DIRECTOR') {
    echo json_encode(["success" => false, "mensaje" => "Acceso denegado"]);
    exit;
}

$query = "SELECT p.idPoliza, p.nombreEmpresaP, p.estadoP, c.nombreC, c.apellidoC, pl.nombreP
          FROM poliza p
          JOIN cliente c ON p.idCliente = c.idCliente
          JOIN plan pl ON p.idPlan = pl.idPlan
          ORDER BY p.idPoliza DESC";
$resultado = $mysqli->query($query);

$polizas = [];
while($row = $resultado->fetch_assoc()){
    $polizas[] = $row;
}

echo json_encode(["success" => true, "polizas" => $polizas]);
$mysqli->close();
?>