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

$idTicket = $_GET['id'] ?? "";


// Comprueba que se haya recibido el ticket
if (empty($idTicket)) {

    echo json_encode([
        "success" => false,
        "mensaje" => "No se recibió el id del ticket"
    ]);

    exit;
}


// Busca el ticket y comprueba que pertenezca al cliente
$query = "
    SELECT
        t.idTicket,
        t.idPoliza,
        t.idEmpleado,
        t.conceptoT,
        t.descripcionT,
        t.notasTecnico,
        t.statusT,
        t.modalidadAtencionT,
        t.fechaCreacionT,
        t.fechaAtencionT,
        t.conformidadCliente,
        t.fechaCierreT,

        p.nombreEmpresaP,

        pl.nombreP,

        e.nombresEmp,
        e.apellidosEmp

    FROM ticket t

    INNER JOIN poliza p
        ON t.idPoliza = p.idPoliza

    INNER JOIN plan pl
        ON p.idPlan = pl.idPlan

    LEFT JOIN empleado e
        ON t.idEmpleado = e.idEmpleado

    WHERE t.idTicket = ?
      AND p.idCliente = ?

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
    "ii",
    $idTicket,
    $idCliente
);


if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmt->error
    ]);

    exit;
}


$resultado = $stmt->get_result();


// Comprueba que el ticket exista y sea del cliente
if ($resultado->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Ticket no encontrado"
    ]);

    exit;
}


$ticket = $resultado->fetch_assoc();


// Devuelve la información del ticket
echo json_encode([
    "success" => true,
    "ticket" => $ticket
]);


$stmt->close();
$mysqli->close();

?>