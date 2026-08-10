<?php
session_start();
include("../../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idEmpleado']) || $_SESSION['perfil'] !== 'DIRECTOR') {
    echo json_encode(["success" => false, "mensaje" => "Acceso denegado"]);
    exit;
}

$idEmpleado = $_SESSION['idEmpleado'];
$nombres = trim($_POST['nombre'] ?? "");
$apellidos = trim($_POST['apellido'] ?? "");
$correo = trim($_POST['correo'] ?? "");
$password = $_POST['password'] ?? "";

if (empty($nombres) || empty($apellidos) || empty($correo)) {
    echo json_encode(["success" => false, "mensaje" => "Completa los campos obligatorios"]);
    exit;
}

// es la misma logica que el de cliente, si se envio la contraseña nueva la actualiza, si no, solo los otros datos
if (!empty($password)) {
    $query = "UPDATE empleado SET nombresEmp = ?, apellidosEmp = ?, emailEmp = ?, pass = ? WHERE idEmpleado = ?";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("ssssi", $nombres, $apellidos, $correo, $password, $idEmpleado);
} else {
    $query = "UPDATE empleado SET nombresEmp = ?, apellidosEmp = ?, emailEmp = ? WHERE idEmpleado = ?";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("sssi", $nombres, $apellidos, $correo, $idEmpleado);
}

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "mensaje" => "Error de BD: " . $stmt->error]);
    exit;
}

// actualiza la variable de sesion para que el "Hola, [Nombre]" cambie
$_SESSION['usuario'] = $nombres . " " . $apellidos;

echo json_encode(["success" => true, "mensaje" => "Perfil actualizado correctamente"]);

$stmt->close();
$mysqli->close();
?>