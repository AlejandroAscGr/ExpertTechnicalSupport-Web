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
$idPoliza = intval($_POST['idPoliza'] ?? 0);


if ($idPoliza <= 0) {

    echo json_encode([
        "success" => false,
        "mensaje" => "La póliza no es válida"
    ]);

    exit;
}


$query = "
    UPDATE poliza
    SET estadoP = 'Cancelada'
    WHERE idPoliza = ?
    AND idCliente = ?
    AND estadoP <> 'Cancelada'
";


$stmt = $mysqli->prepare($query);


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "mensaje" => $mysqli->error
    ]);

    exit;
}


$stmt->bind_param(
    "ii",
    $idPoliza,
    $idCliente
);


if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmt->error
    ]);

    exit;
}


if ($stmt->affected_rows === 0) {

    echo json_encode([
        "success" => false,
        "mensaje" => "La póliza no existe o ya está cancelada"
    ]);

    $stmt->close();
    $mysqli->close();

    exit;
}


echo json_encode([
    "success" => true,
    "mensaje" => "Póliza cancelada correctamente"
]);


$stmt->close();
$mysqli->close();

?>