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

$idTicket = $_POST['idTicket'] ?? "";
$respuesta = $_POST['respuesta'] ?? "";


// Comprueba los datos recibidos
if (empty($idTicket) || !in_array($respuesta, ["solucionado", "continua"])) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Datos inválidos"
    ]);

    exit;
}


// Comprueba que el ticket pertenezca al cliente
$queryTicket = "
    SELECT t.idTicket

    FROM ticket t

    INNER JOIN poliza p
        ON t.idPoliza = p.idPoliza

    WHERE t.idTicket = ?
      AND p.idCliente = ?

    LIMIT 1
";


$stmtTicket = $mysqli->prepare($queryTicket);

$stmtTicket->bind_param(
    "ii",
    $idTicket,
    $idCliente
);

$stmtTicket->execute();

$resultado = $stmtTicket->get_result();


if ($resultado->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Ticket no encontrado"
    ]);

    exit;
}


// Convierte la respuesta del cliente en 1 o 0
$conformidad = $respuesta === "solucionado" ? 1 : 0;


// Actualiza la conformidad
$queryActualizar = "
    UPDATE ticket

    SET conformidadCliente = ?

    WHERE idTicket = ?
";


$stmtActualizar = $mysqli->prepare($queryActualizar);

$stmtActualizar->bind_param(
    "ii",
    $conformidad,
    $idTicket
);


if (!$stmtActualizar->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmtActualizar->error
    ]);

    exit;
}


echo json_encode([
    "success" => true,
    "mensaje" => $respuesta === "solucionado"
        ? "Solución confirmada correctamente"
        : "Se indicó que el problema continúa"
]);


$stmtTicket->close();
$stmtActualizar->close();
$mysqli->close();

?>