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


// Obtiene las pólizas reales del cliente y su plan
$query = "
    SELECT
        p.idPoliza,
        p.nombreEmpresaP,
        p.direccionServicioP,
        p.correoP,
        p.telefonoP,
        p.idPlan,
        p.estadoP,
        p.fechaInicioP,
        p.fechaVencimientoP,

        pl.nombreP,
        pl.maxPres,
        pl.maxRem,
        pl.maxAse,

        c.nombreC,
        c.apellidoC

    FROM poliza p

    INNER JOIN plan pl
        ON p.idPlan = pl.idPlan

    INNER JOIN cliente c
        ON p.idCliente = c.idCliente

    WHERE p.idCliente = ?

    ORDER BY p.idPoliza DESC
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

$polizas = [];


// Guarda cada póliza encontrada
while ($row = $resultado->fetch_assoc()) {

    $polizas[] = $row;
}


echo json_encode([
    "success" => true,
    "polizas" => $polizas
]);


$stmt->close();
$mysqli->close();

?>