<?php

session_start();
include("../backend_general/conexion.php");

header("Content-Type: application/json; charset=utf-8");


if (!isset($_SESSION['idCliente'])) {

    echo json_encode([
        "success" => false,
        "mensaje" => "No hay una sesión de cliente activa"
    ]);

    exit;
}


$idCliente = $_SESSION['idCliente'];

$nombre = trim($_POST['nombre'] ?? "");
$apellido = trim($_POST['apellido'] ?? "");
$telefono = trim($_POST['telefono'] ?? "");
$correo = trim($_POST['correo'] ?? "");
$empresa = trim($_POST['empresa'] ?? "");
$password = $_POST['password'] ?? "";


if (
    empty($nombre) ||
    empty($apellido) ||
    empty($telefono) ||
    empty($correo)
) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Completa los campos obligatorios"
    ]);

    exit;
}


// Si escribió una nueva contraseña, también la actualiza
if (!empty($password)) {

    $query = "
        UPDATE cliente
        SET
            nombreC = ?,
            apellidoC = ?,
            telefonoC = ?,
            correoC = ?,
            empresaC = ?,
            passC = ?
        WHERE idCliente = ?
    ";

    $stmt = $mysqli->prepare($query);

    $stmt->bind_param(
        "ssssssi",
        $nombre,
        $apellido,
        $telefono,
        $correo,
        $empresa,
        $password,
        $idCliente
    );

} else {

    $query = "
        UPDATE cliente
        SET
            nombreC = ?,
            apellidoC = ?,
            telefonoC = ?,
            correoC = ?,
            empresaC = ?
        WHERE idCliente = ?
    ";

    $stmt = $mysqli->prepare($query);

    $stmt->bind_param(
        "sssssi",
        $nombre,
        $apellido,
        $telefono,
        $correo,
        $empresa,
        $idCliente
    );
}


if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmt->error
    ]);

    exit;
}


echo json_encode([
    "success" => true,
    "mensaje" => "Perfil actualizado correctamente"
]);


$stmt->close();
$mysqli->close();

?>