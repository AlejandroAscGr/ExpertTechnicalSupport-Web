<?php
session_start();
include("../../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idEmpleado']) || $_SESSION['perfil'] !== 'DIRECTOR') {
    echo json_encode(["success" => false, "mensaje" => "Acceso denegado"]);
    exit;
}

$idEmpleado = $_SESSION['idEmpleado'];
$query = "SELECT nombresEmp, apellidosEmp, emailEmp, rolEmp FROM empleado WHERE idEmpleado = ?";

$stmt = $mysqli->prepare($query);
$stmt->bind_param("i", $idEmpleado);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode(["success" => false, "mensaje" => "Usuario no encontrado"]);
    exit;
}

$empleado = $resultado->fetch_assoc();
echo json_encode(["success" => true, "perfil" => $empleado]);

$stmt->close();
$mysqli->close();
?>