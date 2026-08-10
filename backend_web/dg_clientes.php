<?php
session_start();
include("../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idEmpleado']) || $_SESSION['perfil'] !== 'DIRECTOR') {
    echo json_encode(["success" => false, "mensaje" => "Acceso denegado"]);
    exit;
}

$query = "SELECT idCliente, nombreC, apellidoC, telefonoC, correoC, fechaAltaC FROM cliente ORDER BY idCliente DESC";
$resultado = $mysqli->query($query);

$clientes = [];
while($row = $resultado->fetch_assoc()){
    $clientes[] = $row;
}

echo json_encode(["success" => true, "clientes" => $clientes]);
$mysqli->close();
?>