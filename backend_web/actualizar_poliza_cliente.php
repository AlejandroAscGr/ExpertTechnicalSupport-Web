<?php

session_start();
include("../backend_general/conexion.php");

header("Content-Type: application/json; charset=utf-8");


// Comprueba la sesión del cliente
if (!isset($_SESSION['idCliente'])) {

    echo json_encode([
        "success" => false,
        "mensaje" => "No hay una sesión de cliente activa"
    ]);

    exit;
}


$idCliente = intval($_SESSION['idCliente']);

$idPoliza = intval(
    $_POST['idPoliza'] ?? 0
);

$empresa = trim(
    $_POST['empresa'] ?? ""
);

$telefono = trim(
    $_POST['telefono'] ?? ""
);

$correo = trim(
    $_POST['correo'] ?? ""
);

$direccion = trim(
    $_POST['direccion'] ?? ""
);


// Valida los campos obligatorios
if (
    $idPoliza <= 0 ||
    empty($empresa) ||
    empty($telefono) ||
    empty($correo) ||
    empty($direccion)
) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Completa los campos obligatorios"
    ]);

    exit;
}


// Valida el formato del correo
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "mensaje" => "El correo no tiene un formato válido"
    ]);

    exit;
}


// Valida el teléfono
if (
    !ctype_digit($telefono) ||
    strlen($telefono) !== 10
) {

    echo json_encode([
        "success" => false,
        "mensaje" => "El teléfono debe contener 10 dígitos"
    ]);

    exit;
}


// Actualiza únicamente una póliza del cliente actual
$query = "
    UPDATE poliza

    SET
        nombreEmpresaP = ?,
        telefonoP = ?,
        correoP = ?,
        direccionServicioP = ?

    WHERE idPoliza = ?
    AND idCliente = ?
";


$stmt = $mysqli->prepare($query);


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "mensaje" => $mysqli->error
    ]);

    $mysqli->close();

    exit;
}


$stmt->bind_param(
    "ssssii",
    $empresa,
    $telefono,
    $correo,
    $direccion,
    $idPoliza,
    $idCliente
);


if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmt->error
    ]);

    $stmt->close();
    $mysqli->close();

    exit;
}


echo json_encode([
    "success" => true,
    "mensaje" => "Datos de la póliza actualizados correctamente"
]);


$stmt->close();
$mysqli->close();

?>