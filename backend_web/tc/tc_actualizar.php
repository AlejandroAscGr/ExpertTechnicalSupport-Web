<?php
session_start();
include("../../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idEmpleado']) || $_SESSION['perfil'] !== 'TECNICO') {
    echo json_encode(["success" => false, "mensaje" => "Acceso denegado"]);
    exit;
}

$idTicket = intval($_POST['idTicket'] ?? 0);
$status = $_POST['statusT'] ?? '';
$notas = trim($_POST['notasTecnico'] ?? '');

if($status === 'Cerrado'){
    $query = "UPDATE ticket SET statusT = ?, notasTecnico = ?, fechaCierreT = CURDATE() WHERE idTicket = ? AND idEmpleado = ?";
} else {
    $query = "UPDATE ticket SET statusT = ?, notasTecnico = ?, fechaCierreT = NULL WHERE idTicket = ? AND idEmpleado = ?";
}

$stmt = $mysqli->prepare($query);
$stmt->bind_param("ssii", $status, $notas, $idTicket, $_SESSION['idEmpleado']);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "mensaje" => "Ticket actualizado"]);
} else {
    echo json_encode(["success" => false, "mensaje" => "Error al actualizar"]);
}

$stmt->close();
$mysqli->close();
?>