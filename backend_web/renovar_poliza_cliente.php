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


/*
    Si la póliza ya venció:
    - La nueva vigencia inicia hoy.
    - Termina dentro de un año.

    Si todavía está vigente:
    - Conserva su fecha inicial.
    - Agrega un año al vencimiento actual.
*/
$query = "
    UPDATE poliza

    SET
        fechaInicioP = CASE

            WHEN fechaVencimientoP < CURDATE()
                THEN CURDATE()

            ELSE fechaInicioP

        END,

        fechaVencimientoP = CASE

            WHEN fechaVencimientoP < CURDATE()
                THEN DATE_ADD(CURDATE(), INTERVAL 1 MONTH)

            ELSE DATE_ADD(
                fechaVencimientoP,
                INTERVAL 1 MONTH
            )

        END,

        estadoP = 'Activa'

    WHERE idPoliza = ?
    AND idCliente = ?
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
        "mensaje" => "La póliza no existe o no pertenece al cliente"
    ]);

    $stmt->close();
    $mysqli->close();

    exit;
}


echo json_encode([
    "success" => true,
    "mensaje" => "Póliza renovada correctamente"
]);


$stmt->close();
$mysqli->close();

?>