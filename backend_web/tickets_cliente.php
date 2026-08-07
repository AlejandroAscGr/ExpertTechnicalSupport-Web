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


// Busca los tickets pertenecientes a las pólizas del cliente
$query = "
    SELECT
        t.idTicket,
        t.idPoliza,
        t.conceptoT,
        t.statusT,
        t.modalidadAtencionT,
        t.fechaCreacionT,
        p.nombreEmpresaP,
        pl.nombreP

    FROM ticket t

    INNER JOIN poliza p
        ON t.idPoliza = p.idPoliza

    INNER JOIN plan pl
        ON p.idPlan = pl.idPlan

    WHERE p.idCliente = ?

    ORDER BY t.idTicket DESC
";


$stmt = $mysqli->prepare($query);


// Comprueba que la consulta se haya preparado correctamente
if (!$stmt) {

    echo json_encode([
        "success" => false,
        "mensaje" => $mysqli->error
    ]);

    exit;
}


// Coloca el id del cliente en el signo ?
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

$tickets = [];


// Guarda cada ticket encontrado
while ($row = $resultado->fetch_assoc()) {

    $tickets[] = $row;
}


// Devuelve los tickets al frontend
echo json_encode([
    "success" => true,
    "tickets" => $tickets
]);


$stmt->close();
$mysqli->close();

?>