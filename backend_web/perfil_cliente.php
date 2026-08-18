<?php

session_start();
include("../backend_general/conexion.php");

header("Content-Type: application/json; charset=utf-8");


// Comprueba que exista una sesión de cliente
if (!isset($_SESSION['idCliente'])) {

    echo json_encode([
        "success" => false,
        "mensaje" => "No hay una sesión de cliente activa"
    ]);

    exit;
}


$idCliente = $_SESSION['idCliente'];


// Consulta los datos del cliente logueado
$query = "
    SELECT
        idCliente,
        nombreC,
        apellidoC,
        telefonoC,
        correoC,
        fechaAltaC

    FROM cliente

    WHERE idCliente = ?

    LIMIT 1
";


$stmt = $mysqli->prepare($query);


// Comprueba que la consulta se prepare correctamente
if (!$stmt) {

    echo json_encode([
        "success" => false,
        "mensaje" => $mysqli->error
    ]);

    exit;
}


$stmt->bind_param(
    "i",
    $idCliente
);


// Ejecuta la consulta
if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmt->error
    ]);

    exit;
}


$resultado = $stmt->get_result();


// Comprueba que el cliente exista
if ($resultado->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Cliente no encontrado"
    ]);

    exit;
}


$cliente = $resultado->fetch_assoc();


// Devuelve los datos del perfil
echo json_encode([
    "success" => true,
    "cliente" => $cliente
]);


$stmt->close();
$mysqli->close();

?>